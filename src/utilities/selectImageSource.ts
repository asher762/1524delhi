import type { Media } from '@/payload-types'

// Ordered smallest to largest. `square` and `og` are excluded: they're
// fixed/cropped variants for specific uses (avatar-style crops, OpenGraph
// meta images) rather than general-purpose downscaled copies of the original.
const PRESET_ORDER = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

// The widest viewport we plan for when a `sizes` entry is expressed in `vw`
// or has no media condition at all (i.e. "whatever's left"). Matches the
// `xlarge` preset, which is exactly 1080p wide.
const ASSUMED_MAX_VIEWPORT_PX = 1920

// Covers standard retina/HiDPI screens. Any device denser than this either
// falls back to the original (when no preset is big enough) or gets a
// variant that's a little smaller than ideal at the margin — imperceptible
// for photographic content.
const ASSUMED_MAX_DPR = 2

/**
 * Estimates the largest pixel width a `sizes` attribute could ever resolve
 * to, so we can pick the smallest pre-generated Payload image variant that
 * still covers it — instead of always shipping the full-resolution original
 * through Next's on-demand optimizer.
 *
 * Each comma-separated entry is either `<media-condition> <value>` or a bare
 * `<value>` (the trailing, unconditional fallback). A `max-width: Npx`
 * condition bounds the entry to viewports up to N, so a `vw` value there is
 * evaluated against N. A `min-width` condition or no condition at all means
 * the entry can apply at any width up to our assumed max viewport. Fixed
 * `px` values are viewport-independent and used as-is.
 */
export const estimateMaxRenderedWidth = (sizesAttr: string): number => {
  let maxPx = 0

  for (const rawEntry of sizesAttr.split(',')) {
    const entry = rawEntry.trim()
    const conditionMatch = entry.match(/^\(([^)]+)\)\s*(.+)$/)
    const condition = conditionMatch?.[1]
    const valueToken = conditionMatch?.[2] ?? entry

    const maxWidthCondition = condition?.match(/max-width:\s*(\d+(?:\.\d+)?)px/)
    const referenceViewport = maxWidthCondition
      ? parseFloat(maxWidthCondition[1]!)
      : ASSUMED_MAX_VIEWPORT_PX

    const vwMatch = valueToken.match(/^(\d+(?:\.\d+)?)vw$/)
    const pxMatch = valueToken.match(/^(\d+(?:\.\d+)?)px$/)

    let px = 0
    if (vwMatch) {
      px = (parseFloat(vwMatch[1]!) / 100) * referenceViewport
    } else if (pxMatch) {
      px = parseFloat(pxMatch[1]!)
    }

    if (px > maxPx) maxPx = px
  }

  return maxPx
}

/**
 * Picks the URL of the smallest Payload-generated image variant that's still
 * large enough for how the image is actually being rendered (per the
 * `sizes` attribute), so a small card thumbnail doesn't force Next's
 * optimizer to reprocess a multi-megabyte original on every cold request.
 *
 * Returns `undefined` when no generated variant is big enough (e.g. a
 * full-bleed hero or fullscreen carousel) or the resource has no `sizes` at
 * all — callers should fall back to the original `url` in that case, which
 * preserves full resolution. There's no quality tradeoff either way: the
 * browser displays the image at its rendered size regardless of source
 * resolution, so serving a variant no smaller than that size is visually
 * identical to serving the original.
 */
export const selectImageSource = (resource: Media, sizesAttr: string): string | undefined => {
  const variants = resource.sizes
  if (!variants) return undefined

  const targetWidth = estimateMaxRenderedWidth(sizesAttr) * ASSUMED_MAX_DPR

  for (const preset of PRESET_ORDER) {
    const variant = variants[preset]
    if (variant?.url && variant?.width && variant.width >= targetWidth) {
      return variant.url
    }
  }

  return undefined
}
