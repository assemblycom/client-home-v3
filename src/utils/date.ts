import { getHours } from 'date-fns'

export enum TimeOfDay {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
}

/**
 * - morning:   04:00–11:59
 * - afternoon: 12:00–16:59
 * - evening:   17:00–23:59 and 00:00–03:59
 */
export const getTimeOfDay = (date: Date = new Date()): TimeOfDay => {
  const h = getHours(date)
  // 00:00–03:59 => evening
  if (h >= 0 && h <= 3) return TimeOfDay.EVENING
  // 04:00–11:59 => morning
  if (h >= 4 && h <= 11) return TimeOfDay.MORNING
  // 12:00–16:59 => afternoon
  if (h >= 12 && h <= 16) return TimeOfDay.AFTERNOON
  // 17:00–23:59 => evening
  // (h is 17..23 here)
  return TimeOfDay.EVENING
}
