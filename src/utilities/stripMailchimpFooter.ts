// Every Mailchimp campaign includes a standard footer block (logo, copyright,
// mailing address, "update preferences"/"unsubscribe" links) required for
// CAN-SPAM compliance on actual sent emails. Its merge tags (*|CURRENT_YEAR|*,
// *|UNSUB|*, etc.) only resolve when Mailchimp sends to a real subscriber —
// fetched via the API they render as literal placeholder text, and the
// unsubscribe/preferences links don't make sense on the site anyway.
//
// Mailchimp's block editor consistently marks this block with
// `class="mceFooterSection"` on its wrapping <table>. Table nesting isn't
// regular, so a plain regex can't safely match the whole (balanced) block —
// this walks forward from that table's opening tag, counting nested
// <table>/</table> pairs, to find exactly where it closes.
export function stripMailchimpFooter(html: string): string {
  const marker = 'class="mceFooterSection"'
  const markerIndex = html.indexOf(marker)
  if (markerIndex === -1) return html

  const tableStart = html.lastIndexOf('<table', markerIndex)
  if (tableStart === -1) return html

  const tagRegex = /<table\b|<\/table>/gi
  tagRegex.lastIndex = tableStart

  let depth = 0
  let match: RegExpExecArray | null
  let endIndex = -1

  while ((match = tagRegex.exec(html))) {
    if (match[0].toLowerCase().startsWith('<table')) {
      depth++
    } else {
      depth--
      if (depth === 0) {
        endIndex = match.index + match[0].length
        break
      }
    }
  }

  if (endIndex === -1) return html

  return html.slice(0, tableStart) + html.slice(endIndex)
}

// Mailchimp also inserts a "View this email in your browser" link at the top
// of every campaign, linking to the literal merge tag `*|ARCHIVE|*` — same
// story as the footer's merge tags: it only resolves when Mailchimp actually
// sends the campaign, so fetched via the API it's a dead link. Unlike the
// footer, `<a>`/`<p>` tags don't nest, so a plain (non-balanced) regex is
// safe here.
export function stripArchiveLink(html: string): string {
  const paragraphWithOnlyLink =
    /<p[^>]*>\s*<a[^>]*href=["']\*\|ARCHIVE\|\*["'][^>]*>.*?<\/a>\s*<\/p>/i

  if (paragraphWithOnlyLink.test(html)) {
    return html.replace(paragraphWithOnlyLink, '')
  }

  return html.replace(/<a[^>]*href=["']\*\|ARCHIVE\|\*["'][^>]*>.*?<\/a>/i, '')
}

export function stripMailchimpBoilerplate(html: string): string {
  return stripArchiveLink(stripMailchimpFooter(html))
}
