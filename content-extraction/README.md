# Content Extraction — 1524delhi.com → new site schema

This folder holds content pulled from the old live site (https://1524delhi.com) and
restructured to match the section schema used on the new localhost site
(a Payload CMS build with flexible content blocks: RichText, InfoBlock, CardsBlock,
CarouselBlock, etc.). Text content only — no images/media were extracted.

Every field that has no correlating information on the old site is written as:

`**Unavailable** — _(fill in)_`

so the section header stays in place for manual completion later.

## Inventory

- **Hotels** (11): `hotels/*.md`
- **Villas & Estates** (3): `villas-and-estates/*.md`
- **Journeys** (5): `journeys/*.md`
- **Experiences** (3): `experiences/*.md`

## Template A — Hotels & Villas and Estates

Both collections render with the same block types on the new site (see
`the-danna-langkawi-resort--beach-villas` and `ahilya-by-the-sea` as reference
examples), so they share one template:

```markdown
# {Title}

- **Location (tagline):** {City/Region} | {State/Province}, {Country}
- **Country:** {Country}
- **Categories/Tags:** {list, or Unavailable}
- **Related properties:** Unavailable (relationship field — set manually in CMS)
- **Meta description (SEO):** {if found in old page's <meta name="description">, else Unavailable}

## Overview
{Main descriptive paragraph(s) from the top of the page}

## Highlights
- {bullet}
- {bullet}

## Location
{Description paragraph}

**How to get there**
- {bullet}

## Accommodation
- **{Room/Villa name}** — {description if the old site gives one, else "Unavailable — (fill in)"}
- **{Room/Villa name}** — {...}

## Features / Amenities
{Any named "feature" cards as Title + short description}
- **{Feature title}** — {description}

**In-room amenities** (if the old page lists these as a distinct bullet list)
- {bullet}

**General amenities** (if listed separately)
- {bullet}

## Wellness / Spa
(only if the old page has this section; omit the heading entirely if not present rather than writing Unavailable)

## Dining
- **{Restaurant/venue name}** — {description if given, else "Unavailable — (fill in)"}

## Activities
- {bullet}

## Special Sections
(e.g. Weddings, or any other named section unique to this property — keep the old
site's own heading name)

---
Source: {old site URL}
```

Notes for whoever fills this in (agents and humans alike):
- Keep bullets as bullets; don't collapse them into prose.
- If the old page names a section differently than above (e.g. "Wellness Center"
  instead of "Spa"), keep the old page's own heading text.
- If the old page has a section this template doesn't anticipate, add it under
  "Special Sections" with its original heading.
- Do not guess Categories/Tags from the site's filter buttons unless the page's
  own text makes the category unambiguous — otherwise mark Unavailable.

## Template B — Journeys

Journeys are itinerary-based, not amenity-based, so they get their own template:

```markdown
# {Title}

- **Duration:** {N days}
- **Route/Stops:** {City 1 → City 2 → ... }
- **Country:** {Country}
- **Categories/Tags:** Unavailable

## Overview
{Descriptive paragraph(s)}

## Highlights
- {bullet}

## Daily Itinerary

### Day 1 — {title/location if given} {meal plan e.g. (B/L/D) if given}
{description}

### Day 2 — ...
{description}

---
Source: {old site URL}
```

## Template C — Experiences

Experiences on the old site have no individual detail pages — all content lives
on the single `/experiences` listing page as short cards. Template:

```markdown
# {Title}

- **Location:** {as given, e.g. "MULTI-CITY, INDIA"}
- **Categories/Tags:** Unavailable

## Overview
{Descriptive paragraph}

## Inclusions
- {bullet}

---
Source: https://1524delhi.com/experiences (no individual detail page exists)
```
