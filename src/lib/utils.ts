import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} - ${formatPrice(max)}`
}

// Media type detection
// ============================================

// Video file extensions we know how to play in a <video> element
const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i

// Is this media item a video? Detects by MIME type first (most reliable), then
// falls back to the file extension in the URL. Used to decide between rendering
// a <video> player and a next/image on the product gallery.
export function isVideoUrl(url?: string | null, mimeType?: string | null): boolean {
  if (mimeType && mimeType.startsWith('video/')) return true
  if (!url) return false
  return VIDEO_EXT.test(url)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Safe error message extraction - handles XMLHttpRequest and other error types
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object') {
    // Handle XMLHttpRequest errors
    if ('statusText' in err && typeof (err as { statusText: unknown }).statusText === 'string') {
      return (err as { statusText: string }).statusText || 'Network error'
    }
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message
    }
    // Handle response errors
    if ('responseText' in err && typeof (err as { responseText: unknown }).responseText === 'string') {
      return (err as { responseText: string }).responseText
    }
  }
  return String(err)
}

// Safe error logging
export function logError(context: string, err: unknown): void {
  console.error(context, getErrorMessage(err))
}

// ============================================
// Customization fields (buyer-entered color / size etc.)
// ============================================

// Map color-option names (Hebrew / English) to a CSS background. Order matters —
// more specific names (rose gold, white gold) must come before broader ones (gold).
const SWATCH_COLORS: { match: string[]; css: string }[] = [
  { match: ['רוז', 'rose'], css: 'linear-gradient(135deg,#f7d9cb,#b76e79)' },
  { match: ['זהב לבן', 'white gold'], css: 'linear-gradient(135deg,#fafafa,#cfcfcf)' },
  { match: ['זהב', 'gold'], css: 'linear-gradient(135deg,#f9e7b3,#d4af37)' },
  { match: ['כסף', 'כסוף', 'silver'], css: 'linear-gradient(135deg,#f5f5f5,#b8b8b8)' },
  { match: ['פלטינ', 'platinum'], css: 'linear-gradient(135deg,#f0f0f0,#c9c9c9)' },
  { match: ['שחור', 'black'], css: '#1a1a1a' },
  { match: ['לבן', 'white'], css: '#ffffff' },
  { match: ['אדום', 'red'], css: '#dc2626' },
  { match: ['כחול', 'blue'], css: '#2563eb' },
  { match: ['ירוק', 'green'], css: '#16a34a' },
  { match: ['צהוב', 'yellow'], css: '#facc15' },
  { match: ['כתום', 'orange'], css: '#f97316' },
  { match: ['סגול', 'purple'], css: '#7c3aed' },
  { match: ['ורוד', 'pink'], css: '#ec4899' },
  { match: ['חום', 'brown'], css: '#92400e' },
  { match: ['אפור', 'gray', 'grey'], css: '#9ca3af' },
]

// Resolve a color-option name to a CSS background (named map → raw hex → neutral)
export function swatchColor(raw: string): string {
  const v = raw.trim()
  const lower = v.toLowerCase()
  for (const entry of SWATCH_COLORS) {
    if (entry.match.some((m) => v.includes(m) || lower.includes(m))) return entry.css
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v
  return '#e5e7eb'
}

const COLOR_KEY = /colou?r|צבע|tzeva/i
const SIZE_KEY = /size|מידה|mida/i

// Does this value resolve to a real color (i.e. not the neutral fallback)?
function isColorValue(value: string): boolean {
  return swatchColor(value) !== '#e5e7eb'
}

export interface CustomizationEntry {
  key: string
  /** Display label, or '' when the field name isn't resolved yet */
  label: string
  value: string
  isColor: boolean
}

// Turn a cart/line-item metadata bag (buyer-entered field values keyed by the
// field's opaque key) into a display list. `labelMap` (key → field name, e.g. from
// useCustomizationLabels) supplies real labels; without it we fall back to a known
// name (color/size) or '' — never the raw key. Used in cart, drawer and checkout.
export function getCustomizationEntries(
  metadata: Record<string, unknown> | null | undefined,
  labelMap?: Record<string, string>
): CustomizationEntry[] {
  if (!metadata) return []
  return Object.entries(metadata)
    .filter(
      ([, v]) =>
        v !== null &&
        v !== undefined &&
        v !== '' &&
        !(Array.isArray(v) && v.length === 0)
    )
    .map(([key, v]) => {
      const value = Array.isArray(v) ? v.join(', ') : String(v)
      const resolved = labelMap?.[key]
      const known = COLOR_KEY.test(key) ? 'צבע' : SIZE_KEY.test(key) ? 'מידה' : ''
      const label = resolved || known
      const isColor =
        COLOR_KEY.test(key) ||
        (resolved ? COLOR_KEY.test(resolved) : false) ||
        isColorValue(value)
      return { key, label, value, isColor }
    })
}
