import type { Tx } from './base-drizzle.repository'

export interface BaseRepository {
  setTx(tx: Tx): void
  unsetTx(): void
}
