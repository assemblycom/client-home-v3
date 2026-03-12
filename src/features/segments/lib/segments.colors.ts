const CATEGORICAL_COLORS = ['#56C6BE', '#EAF5F4', '#E9728B', '#E7B04A', '#F7F1E4'] as const

export const allocateSegmentColors = (segmentCount: number): string[] => {
  const used = new Set<string>()
  const colors: string[] = []

  for (let i = 0; i < segmentCount; i++) {
    const available = CATEGORICAL_COLORS.filter((c) => !used.has(c))

    const pool = available.length > 0 ? available : [...CATEGORICAL_COLORS]
    const picked = pool[Math.floor(Math.random() * pool.length)]

    colors.push(picked)
    used.add(picked)

    if (used.size === CATEGORICAL_COLORS.length) {
      used.clear()
    }
  }

  return colors
}
