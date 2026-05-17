import { MongoClient, ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root
config({ path: resolve(__dirname, '../.env') })

// Load seed data
const seedData = JSON.parse(readFileSync(resolve(__dirname, './seed-data.json'), 'utf-8'))

type SeedDoc = Record<string, any>

const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null

const now = new Date().toISOString()

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set in .env')

  console.log('Connecting to MongoDB Atlas...')
  const client = new MongoClient(url)

  try {
    await client.connect()
  } catch (err: any) {
    throw new Error('MongoDB connection failed: ' + err.message)
  }

  console.log('Connected.')

  const dbName = (() => {
    try {
      return (
        new URL(url.replace('mongodb+srv://', 'https://')).pathname.replace('/', '') || 'payload'
      )
    } catch {
      return 'payload'
    }
  })()

  const db = client.db(dbName)
  console.log(`Using database: "${dbName}"`)

  const deleteOrder = [
    'journeys',
    'experiences',
    'villas-and-estates',
    'hotels',
    'media',
    'categories',
  ]

  console.log('\nDeleting existing docs...')
  for (const col of deleteOrder) {
    const result = await db.collection(col).deleteMany({})
    console.log(`  Deleted ${result.deletedCount} docs from [${col}]`)
  }

  console.log('\nInserting categories...')
  const categoryMap = new Map<string, ObjectId>()
  for (const cat of seedData.categories as SeedDoc[]) {
    const _id = new ObjectId()
    await db
      .collection('categories')
      .insertOne({ _id, title: cat.title, slug: cat.slug, updatedAt: now, createdAt: now })
    categoryMap.set(cat.slug, _id)
    console.log(`  + ${cat.title}`)
  }

  console.log('\nInserting media...')
  const mediaMap = new Map<string, ObjectId>()
  for (const m of seedData.media as SeedDoc[]) {
    const _id = new ObjectId()
    await db
      .collection('media')
      .insertOne({
        _id,
        alt: m.alt,
        url: m.url,
        filename: m.filename,
        updatedAt: now,
        createdAt: now,
      })
    mediaMap.set(m.filename, _id)
    console.log(`  + ${m.filename}`)
  }

  const mapDoc = (doc: SeedDoc) => ({
    title: doc.title,
    location: doc.location,
    slug: doc.slug,
    content: doc.content ?? null,
    categories: Array.isArray(doc.categories)
      ? doc.categories.map((s: string) => categoryMap.get(s)).filter(isDefined)
      : [],
    heroImage: doc.heroImage ? (mediaMap.get(doc.heroImage) ?? null) : null,
    logoImage: doc.logoImage ? (mediaMap.get(doc.logoImage) ?? null) : null,
    meta: {
      title: doc.meta?.title ?? null,
      description: doc.meta?.description ?? null,
      image: doc.meta?.image ? (mediaMap.get(doc.meta.image) ?? null) : null,
    },
    publishedAt: doc.publishedAt ?? now,
    _status: doc._status ?? 'published',
    updatedAt: now,
    createdAt: now,
  })

  const insertDocs = async (slug: string, docs: SeedDoc[]) => {
    const map = new Map<string, ObjectId>()
    console.log(`\nInserting ${slug}...`)
    for (const doc of docs) {
      const _id = new ObjectId()
      await db.collection(slug).insertOne({ _id, ...mapDoc(doc) })
      map.set(doc.slug, _id)
      console.log(`  + ${doc.title}`)
    }
    return map
  }

  const hotelMap = await insertDocs('hotels', seedData.hotels)
  const villaMap = await insertDocs('villas-and-estates', seedData['villas-and-estates'])
  const expMap = await insertDocs('experiences', seedData.experiences)
  const journeyMap = await insertDocs('journeys', seedData.journeys)

  const applyRelations = async (
    slug: string,
    docs: SeedDoc[],
    selfMap: Map<string, ObjectId>,
    field: string,
  ) => {
    for (const doc of docs) {
      const docId = selfMap.get(doc.slug)
      if (!docId) continue
      const related = Array.isArray(doc[field])
        ? doc[field].map((s: string) => selfMap.get(s)).filter(isDefined)
        : []
      if (!related.length) continue
      await db.collection(slug).updateOne({ _id: docId }, { $set: { [field]: related } })
      console.log(`  ~ relationships: ${doc.slug}`)
    }
  }

  console.log('\nApplying relationships...')
  await applyRelations('hotels', seedData.hotels, hotelMap, 'relatedHotels')
  await applyRelations(
    'villas-and-estates',
    seedData['villas-and-estates'],
    villaMap,
    'relatedVillasAndEstates',
  )
  await applyRelations('experiences', seedData.experiences, expMap, 'relatedExperiences')
  await applyRelations('journeys', seedData.journeys, journeyMap, 'relatedJourneys')

  await client.close()
  console.log('\nSeed complete.')
}

main().catch((err) => {
  console.error('\nSeed failed:', err)
  process.exit(1)
})
