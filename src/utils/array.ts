export const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0
  return ((index % length) + length) % length
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
