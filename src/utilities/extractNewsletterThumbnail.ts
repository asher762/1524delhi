// Mailchimp campaign HTML always includes a 1x1 open-tracking pixel
// (".../track/open.php") as one of the first <img> tags, so picking the very
// first <img> in the document tends to grab the tracking pixel instead of the
// newsletter's actual hero image. This walks the <img> tags in order and
// returns the first one that isn't a tracking pixel or a tiny spacer image.
export function extractNewsletterThumbnail(html: string): string | null {
  const imgTagRegex = /<img\b[^>]*>/gi
  const tags = html.match(imgTagRegex) || []

  for (const tag of tags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)
    if (!srcMatch) continue

    const src = srcMatch[1]
    if (!/^https?:\/\//i.test(src)) continue
    if (/track\/open\.php/i.test(src)) continue

    const widthMatch = tag.match(/\bwidth\s*=\s*["']?(\d+)/i)
    const heightMatch = tag.match(/\bheight\s*=\s*["']?(\d+)/i)
    const width = widthMatch ? Number(widthMatch[1]) : null
    const height = heightMatch ? Number(heightMatch[1]) : null

    if ((width !== null && width <= 2) || (height !== null && height <= 2)) continue

    return src
  }

  return null
}
