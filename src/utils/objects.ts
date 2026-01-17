export const areObjKeysEqual = (obj1: Record<string, unknown>, obj2: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }
  return true
}
