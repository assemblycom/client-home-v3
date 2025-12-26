import type { DB } from '@/db'
import db from '@/db'

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

abstract class BaseDrizzleRepository {
  public db: DB

  constructor(db: DB) {
    this.db = db
  }

  private dbStack: DB[] = []

  setTx(tx: Tx) {
    this.dbStack.push(this.db)
    this.db = tx as unknown as DB
  }

  unsetTx() {
    const previousDb = this.dbStack.pop()
    if (previousDb) {
      this.db = previousDb
    } else {
      this.db = db
    }
  }
}

export default BaseDrizzleRepository
