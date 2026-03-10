/**
 * Parse a hex color string to linear RGB components (0–1).
 * Supports #RGB, #RRGGBB, and #RRGGBBAA.
 */
const hexToLinearRgb = (hex: string): [number, number, number] => {
  let raw = hex.replace('#', '')

  if (raw.length === 3 || raw.length === 4) {
    raw = raw
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('')
  }

  const r = Number.parseInt(raw.slice(0, 2), 16) / 255
  const g = Number.parseInt(raw.slice(2, 4), 16) / 255
  const b = Number.parseInt(raw.slice(4, 6), 16) / 255

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

  return [toLinear(r), toLinear(g), toLinear(b)]
}

/**
 * WCAG 2.x relative luminance (0 = black, 1 = white).
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToLinearRgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Returns true when the given hex background color is "dark"
 * per WCAG luminance (threshold 0.179 ≈ the midpoint for 4.5:1 contrast).
 */
export const isDarkBackground = (hex?: string): boolean => {
  if (!hex) return false
  return relativeLuminance(hex) < 0.179
}
