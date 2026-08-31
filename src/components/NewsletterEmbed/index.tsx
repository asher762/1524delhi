'use client'

import React, { useRef, useState } from 'react'

// Mailchimp's block editor wraps each section in a <td> with its own
// background-color, containing a table pinned to an inline
// `style="max-width:660px"` (or similar) — that's what actually keeps the
// content narrow; the <body> itself is already white/full-width.
const STYLE_RESET = `<style>
html,body{background:transparent!important;margin:0!important;padding:0!important;}
img{height:auto!important;}
</style>`

// Content-wrapper caps (the thing keeping the whole email narrow) run
// 550-900px in Mailchimp's templates. Small inline `max-width`s below that —
// logos, icons, and the 0px "ghost column" hack used for responsive column
// stacking — must keep their authored width or they'll stretch and break, so
// only caps at or above this are widened.
const CONTENT_WRAPPER_MIN_WIDTH = 400

function widenContentWrapper(html: string): string {
  // Scoped to inline `style="..."` attributes only — the same numbers also
  // show up inside <style>-block @media breakpoints (e.g. `@media
  // (max-width: 480px)`), and rewriting those corrupts the media query
  // syntax entirely rather than widening anything.
  return html.replace(/style=(["'])(.*?)\1/gi, (fullMatch, quote: string, styleContent: string) => {
    const widened = styleContent.replace(/max-width:\s*(\d+(?:\.\d+)?)px/gi, (match, pxValue: string) => {
      const width = parseFloat(pxValue)
      return width >= CONTENT_WRAPPER_MIN_WIDTH ? 'max-width:100%' : match
    })
    return `style=${quote}${widened}${quote}`
  })
}

// Mailchimp already marks content images `max-width:100%;height:auto`
// (that's what stops them overflowing), but doesn't set `width:100%` — so
// once their section's wrapper is stretched by widenContentWrapper, the
// image still renders at its native pixel size and just leaves blank space
// instead of filling the new width. `height:auto` (already present) is what
// keeps this from distorting the aspect ratio. Same size threshold as
// widenContentWrapper: small icons/logos keep their authored size.
function widenLargeImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const widthMatch = imgTag.match(/\bwidth=["']?(\d+(?:\.\d+)?)["']?/i)
    const width = widthMatch ? parseFloat(widthMatch[1]) : null
    if (width === null || width < CONTENT_WRAPPER_MIN_WIDTH) return imgTag

    if (/style=(["'])/i.test(imgTag)) {
      return imgTag.replace(
        /style=(["'])(.*?)\1/i,
        (match, quote: string, style: string) => `style=${quote}${style};width:100%!important${quote}`,
      )
    }
    return imgTag.replace(/<img/i, '<img style="width:100%!important"')
  })
}

function withResponsiveStyles(html: string): string {
  const widened = widenLargeImages(widenContentWrapper(html))
  if (/<head[^>]*>/i.test(widened)) {
    return widened.replace(/<head[^>]*>/i, (match) => `${match}${STYLE_RESET}`)
  }
  return `${STYLE_RESET}${widened}`
}

// Renders the newsletter's raw HTML (fetched from Mailchimp and stored on the
// doc) in a sandboxed iframe instead of embedding Mailchimp's hosted archive
// page — that page ships its own "Subscribe / Past Issues / Translate / RSS"
// toolbar above the actual email, which this avoids entirely. `allow-same-origin`
// (without `allow-scripts`) lets us read the rendered height to size the
// iframe to its content; nothing in the email can execute script or submit forms.
export const NewsletterEmbed: React.FC<{ html: string; title: string }> = ({ html, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  const handleLoad = () => {
    const doc = iframeRef.current?.contentWindow?.document
    if (doc?.documentElement) {
      setHeight(doc.documentElement.scrollHeight)
    }
  }

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0"
      onLoad={handleLoad}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      srcDoc={withResponsiveStyles(html)}
      style={{ height }}
      title={title}
    />
  )
}
