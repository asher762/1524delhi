import { config as loadEnv } from 'dotenv'
loadEnv()

import {
  paragraph,
  heading,
  bulletsParagraph,
  richTextBlock,
  infoBlock,
  contentTwoColumn,
  cardsBlock,
} from './lexical-helpers.mjs'
import { hotels, villas, journeys, experiences, countriesNeeded } from './content-data.mjs'

const { default: configPromise } = await import('../src/payload.config.ts')
const { getPayload } = await import('payload')

function specialPart(part) {
  if (part.p) return paragraph(part.p)
  if (part.h3) return heading('h3', part.h3)
  if (part.bullets) return bulletsParagraph(part.bullets)
  return null
}

function buildHotelLikeLayout(item) {
  const hero = item.heroMedia
  const layout = []

  // 1. Overview
  layout.push(richTextBlock(item.overview.map((p) => paragraph(p)), 'Overview'))

  // 2. Highlights (info block, paired with hero image)
  layout.push(
    infoBlock({
      children: [heading('h2', 'Highlights'), bulletsParagraph(item.highlights)],
      media: hero,
      reverse: false,
      blockName: 'Highlights',
    }),
  )

  // 3. Location (info block, reversed)
  layout.push(
    infoBlock({
      children: [
        heading('h2', 'Location'),
        heading('h3', item.locationSection.tagline),
        ...item.locationSection.paragraphs.map((p) => paragraph(p)),
      ],
      media: hero,
      reverse: true,
      blockName: 'Location',
    }),
  )

  // 4. How to get there (two-column content block, no media needed)
  if (item.howToGetThere && item.howToGetThere.length) {
    layout.push(contentTwoColumn([heading('h2', 'How to get there')], [bulletsParagraph(item.howToGetThere)]))
  }

  // 5. Accommodation (cards)
  if (item.accommodation && item.accommodation.items.length) {
    const header = [heading('h2', 'Accommodation')]
    if (item.accommodation.intro) header.push(paragraph(item.accommodation.intro))
    layout.push(
      cardsBlock(
        item.accommodation.items.map((r) => ({
          title: r.title,
          media: hero,
          description: r.description ? [paragraph(r.description)] : null,
        })),
        header,
        'Accommodation',
      ),
    )
  }

  // 6. Features (cards)
  if (item.features && item.features.length) {
    layout.push(
      cardsBlock(
        item.features.map((f) => ({
          title: f.title,
          media: hero,
          description: f.description ? [paragraph(f.description)] : null,
        })),
        [heading('h2', 'Features')],
        'Features',
      ),
    )
  }

  // 7 & 8. Amenity bullet lists
  if (item.inRoomAmenities && item.inRoomAmenities.length) {
    layout.push(richTextBlock([heading('h2', 'In-Room Amenities'), bulletsParagraph(item.inRoomAmenities)], 'In-Room Amenities'))
  }
  if (item.generalAmenities && item.generalAmenities.length) {
    layout.push(richTextBlock([heading('h2', 'Amenities'), bulletsParagraph(item.generalAmenities)], 'Amenities'))
  }

  // 9. Wellness
  if (item.wellness) {
    const children = [heading('h2', item.wellness.heading), ...item.wellness.paragraphs.map((p) => paragraph(p))]
    if (item.wellness.bullets && item.wellness.bullets.length) children.push(bulletsParagraph(item.wellness.bullets))
    layout.push(richTextBlock(children, item.wellness.heading))
  }

  // 10. Dining
  if (item.dining) {
    const introChildren = [heading('h2', 'Dining'), paragraph(item.dining.intro)]
    if (item.dining.venues && item.dining.venues.length) {
      layout.push(
        cardsBlock(
          item.dining.venues.map((v) => ({
            title: v.title,
            media: hero,
            description: v.description ? [paragraph(v.description)] : null,
          })),
          introChildren,
          'Dining',
        ),
      )
      if (item.dining.note) layout.push(richTextBlock([paragraph(item.dining.note)]))
    } else {
      const children = [...introChildren]
      if (item.dining.bulletNamesOnly && item.dining.bulletNamesOnly.length) {
        children.push(bulletsParagraph(item.dining.bulletNamesOnly))
      }
      layout.push(richTextBlock(children, 'Dining'))
    }
  }

  // 11. Activities
  if (item.activities && item.activities.length) {
    layout.push(richTextBlock([heading('h2', 'Activities'), bulletsParagraph(item.activities)], 'Activities'))
  }

  // 12. Special sections, using the old site's own heading names
  for (const special of item.special || []) {
    const children = [heading('h2', special.heading), ...special.parts.map(specialPart).filter(Boolean)]
    layout.push(richTextBlock(children, special.heading))
  }

  return layout
}

function buildJourneyLayout(item) {
  const layout = []
  layout.push(
    richTextBlock(
      [paragraph(`${item.duration} · ${item.route}`), ...item.overview.map((p) => paragraph(p))],
      'Overview',
    ),
  )
  layout.push(richTextBlock([heading('h2', 'Highlights'), bulletsParagraph(item.highlights)], 'Highlights'))
  const dayChildren = [heading('h2', 'Daily Itinerary')]
  for (const day of item.itinerary) {
    dayChildren.push(heading('h3', day.title))
    dayChildren.push(paragraph(day.body))
  }
  layout.push(richTextBlock(dayChildren, 'Daily Itinerary'))
  return layout
}

function buildExperienceLayout(item) {
  const layout = []
  layout.push(richTextBlock(item.overview.map((p) => paragraph(p)), 'Overview'))
  layout.push(richTextBlock([heading('h2', 'Inclusions'), bulletsParagraph(item.inclusions)], 'Inclusions'))
  return layout
}

async function main() {
  const payload = await getPayload({ config: configPromise })

  // --- Countries ---------------------------------------------------------
  const countryIds = {}
  const existing = await payload.find({ collection: 'countries', limit: 100, overrideAccess: true })
  for (const c of existing.docs) countryIds[c.title] = c.id

  for (const title of countriesNeeded) {
    if (countryIds[title]) continue
    const created = await payload.create({ collection: 'countries', data: { title }, overrideAccess: true })
    countryIds[title] = created.id
    console.log(`Created country: ${title} (id ${created.id})`)
  }

  const results = { hotels: [], 'villas-and-estates': [], journeys: [], experiences: [] }

  // --- Hotels --------------------------------------------------------------
  for (const item of hotels) {
    try {
      const layout = buildHotelLikeLayout(item)
      const doc = await payload.create({
        collection: 'hotels',
        overrideAccess: true,
        draft: false,
        context: { disableRevalidate: true },
        data: {
          title: item.title,
          location: item.location,
          country: [countryIds[item.countryTitle]],
          heroImage: item.heroMedia,
          logoImage: item.logoMedia || undefined,
          layout,
          slug: item.slug,
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      results.hotels.push({ slug: item.slug, id: doc.id, ok: true })
      console.log(`✔ hotel ${item.slug} -> id ${doc.id}`)
    } catch (err) {
      results.hotels.push({ slug: item.slug, ok: false, error: err.message })
      console.error(`✘ hotel ${item.slug} FAILED:`, err.message)
    }
  }

  // --- Villas & Estates ------------------------------------------------------
  for (const item of villas) {
    try {
      const layout = buildHotelLikeLayout(item)
      const doc = await payload.create({
        collection: 'villas-and-estates',
        overrideAccess: true,
        draft: false,
        context: { disableRevalidate: true },
        data: {
          title: item.title,
          location: item.location,
          country: [countryIds[item.countryTitle]],
          heroImage: item.heroMedia,
          logoImage: item.logoMedia || undefined,
          layout,
          slug: item.slug,
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      results['villas-and-estates'].push({ slug: item.slug, id: doc.id, ok: true })
      console.log(`✔ villa ${item.slug} -> id ${doc.id}`)
    } catch (err) {
      results['villas-and-estates'].push({ slug: item.slug, ok: false, error: err.message })
      console.error(`✘ villa ${item.slug} FAILED:`, err.message)
    }
  }

  // --- Journeys ------------------------------------------------------------
  for (const item of journeys) {
    try {
      const layout = buildJourneyLayout(item)
      const doc = await payload.create({
        collection: 'journeys',
        overrideAccess: true,
        draft: false,
        context: { disableRevalidate: true },
        data: {
          title: item.title,
          location: item.location,
          country: [countryIds[item.countryTitle]],
          layout,
          slug: item.slug,
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      results.journeys.push({ slug: item.slug, id: doc.id, ok: true })
      console.log(`✔ journey ${item.slug} -> id ${doc.id}`)
    } catch (err) {
      results.journeys.push({ slug: item.slug, ok: false, error: err.message })
      console.error(`✘ journey ${item.slug} FAILED:`, err.message)
    }
  }

  // --- Experiences ---------------------------------------------------------
  for (const item of experiences) {
    try {
      const layout = buildExperienceLayout(item)
      const doc = await payload.create({
        collection: 'experiences',
        overrideAccess: true,
        draft: false,
        context: { disableRevalidate: true },
        data: {
          title: item.title,
          location: item.location,
          country: [countryIds[item.countryTitle]],
          layout,
          slug: item.slug,
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      results.experiences.push({ slug: item.slug, id: doc.id, ok: true })
      console.log(`✔ experience ${item.slug} -> id ${doc.id}`)
    } catch (err) {
      results.experiences.push({ slug: item.slug, ok: false, error: err.message })
      console.error(`✘ experience ${item.slug} FAILED:`, err.message)
    }
  }

  console.log('\n=== SUMMARY ===')
  for (const [coll, items] of Object.entries(results)) {
    const okCount = items.filter((i) => i.ok).length
    console.log(`${coll}: ${okCount}/${items.length} created`)
    for (const i of items.filter((i) => !i.ok)) console.log(`   FAILED: ${i.slug} - ${i.error}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('FATAL', err)
  process.exit(1)
})
