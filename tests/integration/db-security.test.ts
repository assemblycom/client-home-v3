import { readFileSync } from 'node:fs'
import type { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createTestDb } from '../setup/test-db'

vi.mock('server-only', () => ({}))
vi.mock('@/db', () => ({ default: {} }))

const TABLES = ['settings', 'actions', 'segments', 'conditions', 'segment_configs', 'media', '__drizzle_migrations']
const MIGRATION = 'src/db/migrations/20261119060545_enable-rls.sql'

let client: PGlite

const asAnon = (sql: string) =>
  client.transaction(async (tx) => {
    await tx.exec('set local role anon')
    return (await tx.query(sql)).rows
  })

const rows = async <T>(sql: string) => (await client.query<T>(sql)).rows

beforeAll(async () => {
  client = (await createTestDb()).client
  // Mirror Supabase: API roles exist and hold ALL on every public table and sequence.
  await client.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create table "__drizzle_migrations" (id serial primary key, hash text not null, created_at bigint);
    grant usage on schema public to anon, authenticated;
    grant all on all tables in schema public to anon, authenticated;
    grant all on all sequences in schema public to anon, authenticated;
  `)
  await client.exec(readFileSync(MIGRATION, 'utf8'))
})

afterAll(async () => {
  await client.close()
})

describe('database security', () => {
  describe('anon role', () => {
    it.each(TABLES)('cannot read %s', async (table) => {
      await expect(asAnon(`select * from "${table}" limit 1`)).rejects.toThrow(/permission denied/)
    })

    it.each([
      `insert into "settings" (workspace_id) values ('x')`,
      `update "settings" set workspace_id = 'x'`,
      `delete from "segments"`,
      `truncate "media"`,
      `insert into "__drizzle_migrations" (hash) values ('x')`,
      `delete from "__drizzle_migrations"`,
    ])('cannot write: %s', async (sql) => {
      await expect(asAnon(sql)).rejects.toThrow(/permission denied/)
    })
  })

  describe('catalog', () => {
    it('has RLS on every public table', async () => {
      expect(await rows(`select tablename from pg_tables where schemaname = 'public' and not rowsecurity`)).toEqual([])
    })

    it('never forces RLS on the table owner', async () => {
      expect(
        await rows(`select relname from pg_class where relnamespace = 'public'::regnamespace and relforcerowsecurity`),
      ).toEqual([])
    })

    it('has no policies', async () => {
      expect(await rows(`select tablename from pg_policies where schemaname = 'public'`)).toEqual([])
    })

    it('grants API roles nothing on tables', async () => {
      expect(
        await rows(`
          select grantee, table_name from information_schema.role_table_grants
          where table_schema = 'public' and grantee in ('anon', 'authenticated')`),
      ).toEqual([])
    })

    it('grants API roles nothing on sequences', async () => {
      expect(
        await rows(`
          select grantee, object_name from information_schema.usage_privileges
          where object_schema = 'public' and grantee in ('anon', 'authenticated')`),
      ).toEqual([])
    })
  })

  describe('new tables', () => {
    it('get RLS enabled and no API role grants', async () => {
      await client.transaction(async (tx) => {
        await tx.exec('create table public.__rls_probe (id int)')
        const { rows: probe } = await tx.query(`
          select rowsecurity as rls,
                 has_table_privilege('anon', 'public.__rls_probe', 'SELECT, INSERT, UPDATE, DELETE') as anon,
                 has_table_privilege('authenticated', 'public.__rls_probe', 'SELECT, INSERT, UPDATE, DELETE') as authenticated
          from pg_tables where schemaname = 'public' and tablename = '__rls_probe'`)
        expect(probe).toEqual([{ rls: true, anon: false, authenticated: false }])
        await tx.rollback()
      })
    })
  })

  it('leaves the owner able to read and write', async () => {
    await client.exec(
      `insert into "segments" (workspace_id, created_by_id, name) values ('ws-owner', gen_random_uuid(), 'a')`,
    )
    expect(await rows(`select name from "segments" where workspace_id = 'ws-owner'`)).toEqual([{ name: 'a' }])
  })
})
