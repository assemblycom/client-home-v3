export const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0
  return ((index % length) + length) % length
}

/**
 * Maps `items` through the async `mapper`, running at most `limit` calls at once.
 * Results preserve input order. Use this instead of `Promise.all(items.map(...))`
 * when the mapper opens network connections — a large simultaneous burst can
 * exhaust connection pools / trip connect timeouts (e.g. undici's 10s default).
 */
export const mapWithConcurrency = async <T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length)
  let cursor = 0

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index], index)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker)
  await Promise.all(workers)

  return results
}

// Membership equality for arrays whose order carries no meaning. A missing array counts as empty.
export const areArraysEqualAsSets = <T>(a: readonly T[] = [], b: readonly T[] = []): boolean => {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size !== setB.size) return false

  for (const item of setA) {
    if (!setB.has(item)) return false
  }

  return true
}

export const getArraySymmetricDifference = <T>(a: T[], b: T[]): T[] => {
  const setA = new Set(a)
  const setB = new Set(b)

  const symmetricDiff = new Set<T>()

  for (const item of setA) {
    if (!setB.has(item)) {
      symmetricDiff.add(item)
    }
  }

  for (const item of setB) {
    if (!setA.has(item)) {
      symmetricDiff.add(item)
    }
  }

  return Array.from(symmetricDiff)
}
