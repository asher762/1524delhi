/**
 * 1524 Delhi — Payload CMS Seed Script
 * Run with: npx tsx seed/seed.ts
 *
 * Requires: PAYLOAD_SECRET and DATABASE_URI in your .env
 */

import 'dotenv/config'
import payload from 'payload'
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
const categorySlugToId: Record<string, string> = {}
const mediaSlugToId: Record<string, string> = {}

async function main() {
  await payload.init({ config })

  console.log('🌱 Starting 1524 Delhi seed...\n')

  // ─── 0. Seed Media ────────────────────────────────────────────────────
  console.log('🖼️ Seeding media...')
  for (const item of data.media) {
    try {
      const existing = await payload.find({
        collection: 'media',
        where: { alt: { equals: item.alt } },
      })

      if (existing.totalDocs > 0) {
        mediaSlugToId[item.slug] = existing.docs[0].id as string
        console.log(`  ↩  Skipped (exists): ${item.alt}`)
        continue
      }
      
      const res = await fetch(item.url)
      if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`)
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const parts = item.filename.split('.')
      const ext = parts.pop() || 'jpg'
      let mimeType = 'image/jpeg'
      if (ext.toLowerCase() === 'png') mimeType = 'image/png'
      else if (ext.toLowerCase() === 'webp') mimeType = 'image/webp'
      else if (ext.toLowerCase() === 'svg') mimeType = 'image/svg+xml'

      const created = await payload.create({
        collection: 'media',
        data: {
          alt: item.alt,
        },
        file: {
          data: buffer,
          mimetype: mimeType,
          name: item.filename,
          size: buffer.byteLength,
        }
      })
      mediaSlugToId[item.slug] = created.id as string
      console.log(`  ✅ Created media: ${item.alt}`)
    } catch (err) {
      console.error(`  ❌ Failed media: ${item.alt}`, err)
    }
  }

  // ─── 1. Seed Categories ────────────────────────────────────────────────────
  console.log('📂 Seeding categories...')
  for (const cat of data.categories) {
    try {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: cat.slug } },
      })

      if (existing.totalDocs > 0) {
        categorySlugToId[cat.slug] = existing.docs[0].id as string
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
      categorySlugToId[cat.slug] = created.id as string
      console.log(`  ✅ Created: ${cat.title}`)
    } catch (err) {
      console.error(`  ❌ Failed: ${cat.title}`, err)
    }
  }

  // ─── Helper for collection items ────────────────────────────────────────────────────────
  async function seedCollection(collectionSlug: any, items: any[], name: string) {
    console.log(`\n📄 Seeding ${name}...`)
    for (const item of items) {
      try {
        const existing = await payload.find({
          collection: collectionSlug,
          where: { slug: { equals: item.slug } },
        })

        const categoryIds = (item.categories || []).map((s: string) => categorySlugToId[s]).filter(Boolean)
        
        let dataToCreate: any = {
            title: item.title,
            slug: item.slug,
            generateSlug: false,
            categories: categoryIds,
            content: toRichText(item.content),
            meta: {
              title: item.meta?.title ?? item.title,
              description: item.meta?.description ?? '',
            },
            _status: 'published',
            publishedAt: new Date().toISOString(),
        }
        
        if (item.location) {
            dataToCreate.location = item.location
        }
        
        if (item.heroImage && mediaSlugToId[item.heroImage]) {
            dataToCreate.heroImage = mediaSlugToId[item.heroImage]
        }
        
        if (item.meta?.image && mediaSlugToId[item.meta.image]) {
            dataToCreate.meta.image = mediaSlugToId[item.meta.image]
        }

        if (existing.totalDocs > 0) {
          await payload.update({
            collection: collectionSlug,
            id: existing.docs[0].id,
            data: dataToCreate,
          })
          console.log(`  🔄 Updated: ${item.title}`)
        } else {
          await payload.create({
            collection: collectionSlug,
            data: dataToCreate,
          })
          console.log(`  ✅ Created: ${item.title}`)
        }
      } catch (err) {
        console.error(`  ❌ Failed: ${item.title}`, err)
      }
    }
  }

  await seedCollection('hotels', data.hotels, 'hotels')
  await seedCollection('villas-and-estates', data.villasAndEstates, 'villas & estates')
  await seedCollection('experiences', data.experiences, 'experiences')
  await seedCollection('journeys', data.journeys, 'journeys')
  await seedCollection('posts', data.posts, 'blog posts')

  // ─── 7. Seed Pages ──────────────────────────────────────────────────────────
  console.log('\n📄 Seeding Pages...')
  const pagesToSeed = [
    { title: 'Home', slug: 'home', relationTo: 'posts' },
    { title: 'Hotels', slug: 'hotels', relationTo: 'hotels' },
    { title: 'Villas & Estates', slug: 'villas-and-estates', relationTo: 'villas-and-estates' },
    { title: 'Experiences', slug: 'experiences', relationTo: 'experiences' },
  ]

  for (const p of pagesToSeed) {
    try {
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: p.slug } },
      })

      let pageData: any = {
        title: p.title,
        slug: p.slug,
        generateSlug: false,
        _status: 'published',
        publishedAt: new Date().toISOString(),
        hero: {
          type: 'none',
        },
        layout: [
          {
            blockType: 'archive',
            introContent: toRichText(`Discover our ${p.title.toLowerCase()} collection.`),
            populateBy: 'collection',
            relationTo: p.relationTo,
            limit: 20,
            layout: 'Grid',
          },
        ],
      }

      if (existing.totalDocs > 0) {
        await payload.update({
          collection: 'pages',
          id: existing.docs[0].id,
          data: pageData,
        })
        console.log(` Updated Page: ${p.title}`)
      } else {
        await payload.create({
          collection: 'pages',
          data: pageData,
        })
        console.log(` Created Page: ${p.title}`)
      }
    } catch (err) {
      console.error(` Failed Page: ${p.title}`, err)
    }
  }

  console.log('\n Seed complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
