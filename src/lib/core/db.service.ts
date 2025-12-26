import type { DB } from '@/db'
import db from '@/db'
import type { Tx } from './base-drizzle.repository'

export default class DBService {
  db: DB = db

  static async transaction<T>(txFn: (tx: Tx) => Promise<T>) {
    return await db.transaction(txFn)
  }
}
