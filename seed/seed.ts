/**
 * 1524 Delhi — Payload CMS Seed Script
 * Run with: npx ts-node seed.ts
 * Or via your package.json: "seed": "payload run seed.ts"
 *
 * Requires: PAYLOAD_SECRET and DATABASE_URI in your .env
 */

import payload from 'payload'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '../src/payload.config'

// ─── Import your data ─────────────────────────────────────────────────────────
import data from './data.json'

// ─── Helper: build Payload richText from a plain string ──────────────────────
function toRichText(text: string): any {
  return {
    root: {
      type: 'root',
      children: text.split('\n\n').map((para) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text: para.trim() }],
        direction: 'ltr',
        format: '',
        indent: 0,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ─── Helper: slug map cache ───────────────────────────────────────────────────
const categorySlugToId: Record<string, number> = {}

async function main() {
  await payload.init({ config })

  console.log('🌱 Starting 1524 Delhi seed...\n')

  // ─── 1. Seed Categories ────────────────────────────────────────────────────
  console.log('📂 Seeding categories...')
  for (const cat of data.categories) {
    try {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: cat.slug } },
      })

      if (existing.totalDocs > 0) {
        categorySlugToId[cat.slug] = existing.docs[0].id
        console.log(`  ↩  Skipped (exists): ${cat.title}`)
        continue
      }

      const created = await payload.create({
        collection: 'categories',
        data: {
          title: cat.title,
          slug: cat.slug,
          generateSlug: false,
        },
      })
      categorySlugToId[cat.slug] = created.id
      console.log(`  ✅ Created: ${cat.title}`)
    } catch (err) {
      console.error(`  ❌ Failed: ${cat.title}`, err)
    }
  }

  // ─── 2. Seed Hotels ────────────────────────────────────────────────────────
  console.log('\n🏨 Seeding hotels...')
  for (const hotel of data.hotels) {
    try {
      const existing = await payload.find({
        collection: 'hotels',
        where: { slug: { equals: hotel.slug } },
      })

      if (existing.totalDocs > 0) {
        console.log(`  ↩  Skipped (exists): ${hotel.title}`)
        continue
      }

      const categoryIds = (hotel.categories || []).map((s) => categorySlugToId[s]).filter(Boolean)

      await payload.create({
        collection: 'hotels',
        data: {
          title: hotel.title,
          slug: hotel.slug,
          generateSlug: false,
          location: hotel.location,
          categories: categoryIds,
          content: toRichText(hotel.content),
          meta: {
            title: hotel.meta?.title ?? hotel.title,
            description: hotel.meta?.description ?? '',
          },
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      console.log(`  ✅ Created: ${hotel.title}`)
    } catch (err) {
      console.error(`  ❌ Failed: ${hotel.title}`, err)
    }
  }

  // ─── 3. Seed Villas & Estates ──────────────────────────────────────────────
  console.log('\n🏡 Seeding villas & estates...')
  for (const villa of data.villasAndEstates) {
    try {
      const existing = await payload.find({
        collection: 'villas-and-estates',
        where: { slug: { equals: villa.slug } },
      })

      if (existing.totalDocs > 0) {
        console.log(`  ↩  Skipped (exists): ${villa.title}`)
        continue
      }

      const categoryIds = (villa.categories || []).map((s) => categorySlugToId[s]).filter(Boolean)

      await payload.create({
        collection: 'villas-and-estates',
        data: {
          title: villa.title,
          slug: villa.slug,
          generateSlug: false,
          location: villa.location,
          categories: categoryIds,
          content: toRichText(villa.content),
          meta: {
            title: villa.meta?.title ?? villa.title,
            description: villa.meta?.description ?? '',
          },
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      console.log(`  ✅ Created: ${villa.title}`)
    } catch (err) {
      console.error(`  ❌ Failed: ${villa.title}`, err)
    }
  }

  // ─── 4. Seed Experiences ───────────────────────────────────────────────────
  console.log('\n✨ Seeding experiences...')
  for (const exp of data.experiences) {
    try {
      const existing = await payload.find({
        collection: 'experiences',
        where: { slug: { equals: exp.slug } },
      })

      if (existing.totalDocs > 0) {
        console.log(`  ↩  Skipped (exists): ${exp.title}`)
        continue
      }

      const categoryIds = (exp.categories || []).map((s) => categorySlugToId[s]).filter(Boolean)

      await payload.create({
        collection: 'experiences',
        data: {
          title: exp.title,
          slug: exp.slug,
          generateSlug: false,
          location: exp.location,
          categories: categoryIds,
          content: toRichText(exp.content),
          meta: {
            title: exp.meta?.title ?? exp.title,
            description: exp.meta?.description ?? '',
          },
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      console.log(`  ✅ Created: ${exp.title}`)
    } catch (err) {
      console.error(`  ❌ Failed: ${exp.title}`, err)
    }
  }

  // ─── 5. Seed Journeys ─────────────────────────────────────────────────────
  console.log('\n🗺️  Seeding journeys...')
  for (const journey of data.journeys) {
    try {
      const existing = await payload.find({
        collection: 'journeys',
        where: { slug: { equals: journey.slug } },
      })

      if (existing.totalDocs > 0) {
        console.log(`  ↩  Skipped (exists): ${journey.title}`)
        continue
      }

      const categoryIds = (journey.categories || []).map((s) => categorySlugToId[s]).filter(Boolean)

      await payload.create({
        collection: 'journeys',
        data: {
          title: journey.title,
          slug: journey.slug,
          generateSlug: false,
          location: journey.location,
          categories: categoryIds,
          content: toRichText(journey.content),
          meta: {
            title: journey.meta?.title ?? journey.title,
            description: journey.meta?.description ?? '',
          },
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      console.log(`  ✅ Created: ${journey.title}`)
    } catch (err) {
      console.error(`  ❌ Failed: ${journey.title}`, err)
    }
  }

  // ─── 6. Seed Blog Posts ───────────────────────────────────────────────────
  console.log('\n📝 Seeding blog posts...')
  for (const post of data.posts) {
    try {
      const existing = await payload.find({
        collection: 'posts',
        where: { slug: { equals: post.slug } },
      })

      if (existing.totalDocs > 0) {
        console.log(`  ↩  Skipped (exists): ${post.title}`)
        continue
      }

      const categoryIds = (post.categories || []).map((s) => categorySlugToId[s]).filter(Boolean)

      await payload.create({
        collection: 'posts',
        data: {
          title: post.title,
          slug: post.slug,
          generateSlug: false,
          categories: categoryIds,
          content: toRichText(post.content),
          meta: {
            title: post.meta?.title ?? post.title,
            description: post.meta?.description ?? '',
          },
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
      console.log(`  ✅ Created: ${post.title}`)
    } catch (err) {
      console.error(`  ❌ Failed: ${post.title}`, err)
    }
  }

  console.log('\n🎉 Seed complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
