import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Derive path aliases from tsconfig.json so they stay in sync without duplication.
const tsconfig = JSON.parse(readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf-8')) as {
  compilerOptions: { paths: Record<string, string[]> }
}

const alias = Object.entries(tsconfig.compilerOptions.paths).reduce<Record<string, string>>((acc, [key, [value]]) => {
  const aliasKey = key.replace(/\/\*$/, '')
  const aliasPath = path.resolve(__dirname, value.replace(/\/\*$/, ''))
  acc[aliasKey] = aliasPath
  return acc
}, {})

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: { alias },
})
