/**
 * Parses a hex color string to RGB values.
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const sanitized = hex.replace('#', '')
  const fullHex =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((c) => c + c)
          .join('')
      : sanitized

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  if (!result) return null

  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  }
}

/**
 * Calculates relative luminance per WCAG 2.0.
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Returns true if the given hex color is considered "dark" using perceived brightness.
 * Uses the YIQ formula which better matches human perception than raw luminance.
 * Threshold of 150 (out of 255) is practical for UI text contrast switching.
 */
export const isDarkColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return yiq < 150
}
