import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

type SeedData = {
  categories?: Array<Record<string, any>>
  media?: Array<Record<string, any>>
  hotels?: Array<Record<string, any>>
  'villas-and-estates'?: Array<Record<string, any>>
  experiences?: Array<Record<string, any>>
  journeys?: Array<Record<string, any>>
  pages?: Array<Record<string, any>>
}

type DocumentRecord = Record<string, any>

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

loadEnv({ path: path.resolve(__dirname, '../.env') })
const { default: payloadConfig } = await import('../src/payload.config')

const argv = process.argv.slice(2)
const fileArg = argv[0] ?? process.env.SEED_FILE_PATH
const defaultSeedFile = path.resolve(__dirname, '1524delhi-payload-seed.json')
const seedFilePath = fileArg
  ? path.resolve(process.cwd(), fileArg)
  : existsSync(defaultSeedFile)
    ? defaultSeedFile
    : path.resolve(process.cwd(), 'seed/1524delhi-payload-seed.json')

function loadSeedData(filePath: string): SeedData {
  if (!existsSync(filePath)) {
    throw new Error(`Seed file not found at ${filePath}`)
  }

  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as SeedData
}

async function findExistingBySlug(payload: any, collection: string, slug: string) {
  if (!slug) return null

  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  return result?.docs?.[0] ?? null
}

function buildSimpleRichText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function buildContentLayoutBlock(content: DocumentRecord | null | undefined) {
  return [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: content ?? buildSimpleRichText('Imported content'),
        },
      ],
    },
  ]
}

function buildPageHero(hero: DocumentRecord | null | undefined) {
  if (!hero || hero.type === 'none') {
    return { type: 'none' }
  }

  return {
    type: 'lowImpact',
    richText: hero.richText ?? buildSimpleRichText(hero.title ?? 'Imported hero content'),
  }
}

async function createMedia(payload: any, item: DocumentRecord) {
  console.warn(`Skipping media import for ${item.filename ?? item.url ?? 'unknown media item'}`)
  return null
}

function toPayloadRelationIds(value: unknown, lookup: Map<string, string | number>): any {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? (lookup.get(item) ?? null) : null))
      .filter(Boolean)
  }

  return typeof value === 'string' ? (lookup.get(value) ?? null) : value
}

async function upsertCollectionDocuments(
  payload: any,
  collection: string,
  documents: Array<DocumentRecord>,
  transform: (item: DocumentRecord, index: number) => DocumentRecord,
) {
  const createdDocs: Array<DocumentRecord> = []

  for (const [index, item] of documents.entries()) {
    const normalized = transform(item, index)
    const slug = normalized.slug

    if (!slug) {
      console.warn(`Skipping ${collection} item without slug:`, item.title ?? item.slug)
      continue
    }

    try {
      const existing = await findExistingBySlug(payload, collection, slug)

      if (existing) {
        const updated = await payload.update({
          collection,
          id: existing.id,
          data: normalized,
          overrideAccess: true,
        })
        createdDocs.push(updated)
        console.log(`Updated ${collection}: ${normalized.title}`)
      } else {
        const created = await payload.create({
          collection,
          data: normalized,
          overrideAccess: true,
        })
        createdDocs.push(created)
        console.log(`Created ${collection}: ${normalized.title}`)
      }
    } catch (error) {
      console.warn(`Skipping ${collection} document ${normalized.title ?? slug}:`, error)
    }
  }

  return createdDocs
}

async function main() {
  const seedData = loadSeedData(seedFilePath)
  const payload = await getPayload({ config: payloadConfig })

  console.log(`Seeding Payload from ${seedFilePath}`)

  const categories = seedData.categories ?? []
  const mediaItems = seedData.media ?? []
  const hotels = seedData.hotels ?? []
  const villas = seedData['villas-and-estates'] ?? []
  const experiences = seedData.experiences ?? []
  const journeys = seedData.journeys ?? []
  const pages = seedData.pages ?? []

  const categoryDocs = await upsertCollectionDocuments(
    payload,
    'categories',
    categories,
    (item) => ({ title: item.title, slug: item.slug }),
  )

  const categoryIdMap = new Map(categoryDocs.map((doc) => [doc.slug, doc.id]))

  const mediaDocs = [] as Array<DocumentRecord>
  for (const item of mediaItems) {
    const created = await createMedia(payload, item)
    if (created) {
      mediaDocs.push(created)
    }
  }

  const mediaIdMap = new Map(mediaDocs.map((doc) => [doc.filename, doc.id]))

  const hotelDocs = await upsertCollectionDocuments(payload, 'hotels', hotels, (item) => ({
    title: item.title,
    location: item.location,
    slug: item.slug,
    heroImage: mediaIdMap.get(item.heroImage) ?? null,
    logoImage: mediaIdMap.get(item.logoImage) ?? null,
    layout: buildContentLayoutBlock(item.content ?? item.layout ?? null),
    meta: {
      title: item.meta?.title ?? null,
      description: item.meta?.description ?? null,
      image: item.meta?.image ? (mediaIdMap.get(item.meta.image) ?? null) : null,
    },
    publishedAt: item.publishedAt ?? null,
    _status: item._status ?? 'published',
  }))

  const hotelIdMap = new Map(hotelDocs.map((doc) => [doc.slug, doc.id]))
  const hotelRelationPayload = hotels.map((item) => ({
    slug: item.slug,
    categories: toPayloadRelationIds(item.categories, categoryIdMap),
    relatedHotels: toPayloadRelationIds(item.relatedHotels, hotelIdMap),
  }))

  for (const item of hotelRelationPayload) {
    const existing = await findExistingBySlug(payload, 'hotels', item.slug)
    if (!existing) continue

    await payload.update({
      collection: 'hotels',
      id: existing.id,
      data: {
        categories: item.categories as any,
        relatedHotels: item.relatedHotels as any,
      },
      overrideAccess: true,
    })
  }

  const villaDocs = await upsertCollectionDocuments(
    payload,
    'villas-and-estates',
    villas,
    (item) => ({
      title: item.title,
      location: item.location,
      slug: item.slug,
      heroImage: mediaIdMap.get(item.heroImage) ?? null,
      logoImage: mediaIdMap.get(item.logoImage) ?? null,
      layout: buildContentLayoutBlock(item.content ?? item.layout ?? null),
      meta: {
        title: item.meta?.title ?? null,
        description: item.meta?.description ?? null,
        image: item.meta?.image ? (mediaIdMap.get(item.meta.image) ?? null) : null,
      },
      publishedAt: item.publishedAt ?? null,
      _status: item._status ?? 'published',
    }),
  )

  const villaIdMap = new Map(villaDocs.map((doc) => [doc.slug, doc.id]))
  const villaRelationPayload = villas.map((item) => ({
    slug: item.slug,
    categories: toPayloadRelationIds(item.categories, categoryIdMap),
    relatedVillasAndEstates: toPayloadRelationIds(item.relatedVillasAndEstates, villaIdMap),
  }))

  for (const item of villaRelationPayload) {
    const existing = await findExistingBySlug(payload, 'villas-and-estates', item.slug)
    if (!existing) continue

    await payload.update({
      collection: 'villas-and-estates',
      id: existing.id,
      data: {
        categories: item.categories as any,
        relatedVillasAndEstates: item.relatedVillasAndEstates as any,
      },
      overrideAccess: true,
    })
  }

  const experienceDocs = await upsertCollectionDocuments(
    payload,
    'experiences',
    experiences,
    (item) => ({
      title: item.title,
      location: item.location,
      slug: item.slug,
      heroImage: mediaIdMap.get(item.heroImage) ?? null,
      logoImage: mediaIdMap.get(item.logoImage) ?? null,
      layout: buildContentLayoutBlock(item.content ?? item.layout ?? null),
      meta: {
        title: item.meta?.title ?? null,
        description: item.meta?.description ?? null,
        image: item.meta?.image ? (mediaIdMap.get(item.meta.image) ?? null) : null,
      },
      publishedAt: item.publishedAt ?? null,
      _status: item._status ?? 'published',
    }),
  )

  const experienceIdMap = new Map(experienceDocs.map((doc) => [doc.slug, doc.id]))
  const experienceRelationPayload = experiences.map((item) => ({
    slug: item.slug,
    categories: toPayloadRelationIds(item.categories, categoryIdMap),
    relatedExperiences: toPayloadRelationIds(item.relatedExperiences, experienceIdMap),
  }))

  for (const item of experienceRelationPayload) {
    const existing = await findExistingBySlug(payload, 'experiences', item.slug)
    if (!existing) continue

    await payload.update({
      collection: 'experiences',
      id: existing.id,
      data: {
        categories: item.categories as any,
        relatedExperiences: item.relatedExperiences as any,
      },
      overrideAccess: true,
    })
  }

  const journeyDocs = await upsertCollectionDocuments(payload, 'journeys', journeys, (item) => ({
    title: item.title,
    location: item.location,
    slug: item.slug,
    heroImage: mediaIdMap.get(item.heroImage) ?? null,
    logoImage: mediaIdMap.get(item.logoImage) ?? null,
    layout: buildContentLayoutBlock(item.content ?? item.layout ?? null),
    meta: {
      title: item.meta?.title ?? null,
      description: item.meta?.description ?? null,
      image: item.meta?.image ? (mediaIdMap.get(item.meta.image) ?? null) : null,
    },
    publishedAt: item.publishedAt ?? null,
    _status: item._status ?? 'published',
  }))

  const journeyIdMap = new Map(journeyDocs.map((doc) => [doc.slug, doc.id]))
  const journeyRelationPayload = journeys.map((item) => ({
    slug: item.slug,
    categories: toPayloadRelationIds(item.categories, categoryIdMap),
    relatedJourneys: toPayloadRelationIds(item.relatedJourneys, journeyIdMap),
  }))

  for (const item of journeyRelationPayload) {
    const existing = await findExistingBySlug(payload, 'journeys', item.slug)
    if (!existing) continue

    await payload.update({
      collection: 'journeys',
      id: existing.id,
      data: {
        categories: item.categories as any,
        relatedJourneys: item.relatedJourneys as any,
      },
      overrideAccess: true,
    })
  }

  await upsertCollectionDocuments(payload, 'pages', pages, (item) => ({
    title: item.title,
    slug: item.slug,
    hero: buildPageHero(item.hero),
    layout: buildContentLayoutBlock(item.content ?? null),
    meta: {
      title: item.meta?.title ?? null,
      description: item.meta?.description ?? null,
      image: item.meta?.image ? (mediaIdMap.get(item.meta.image) ?? null) : null,
    },
    publishedAt: item.publishedAt ?? null,
    _status: item._status ?? 'published',
  }))

  console.log('Seed import completed successfully.')
}

main().catch((error) => {
  console.error('Seed import failed:', error)
  process.exit(1)
})
