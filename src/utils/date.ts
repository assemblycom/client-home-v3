export enum TimeOfDay {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
}

/**
 * - morning:   00:00–11:59 (hours < 12)
 * - afternoon: 12:00–17:59 (hours < 18)
 * - evening:   18:00–23:59 (hours >= 18)
 */
export const getTimeOfDay = (date: Date = new Date()): TimeOfDay => {
  const h = date.getHours()

  if (h < 12) return TimeOfDay.MORNING
  if (h < 18) return TimeOfDay.AFTERNOON
  return TimeOfDay.EVENING
}
