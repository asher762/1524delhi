/**
 * One-time repair script: re-publishes all documents that exist in live tables
 * but are missing version entries in _*_v tables.
 *
 * Run with:  npx tsx scripts/republish-docs.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// Collections that have drafts/versions enabled
const VERSIONED_COLLECTIONS = [
  'pages',
  'villas-and-estates',
  // Add these back once data is migrated:
  // 'hotels',
  // 'posts',
  // 'experiences',
  // 'journeys',
] as const

async function main() {
  const payload = await getPayload({ config })

  for (const collection of VERSIONED_COLLECTIONS) {
    console.log(`\n--- Processing collection: ${collection} ---`)

    // Use raw DB pool to find all IDs, bypassing Payload's version-aware query
    // which would also return nothing (it reads from _v tables too)
    const tableName = collection.replace(/-/g, '_')
    const result = await payload.db.pool.query(
      `SELECT id, slug FROM "${tableName}" ORDER BY id`,
    )

    const rows = result.rows as { id: number; slug: string }[]
    console.log(`Found ${rows.length} documents in live table`)

    for (const row of rows) {
      try {
        // Re-publishing via update triggers Payload to create a version entry
        // in the _v table and properly link it to the live document.
        await payload.update({
          collection,
          id: row.id,
          data: {}, // empty data = no field changes, just re-saves + versions
          overrideAccess: true,
          publishSpecificLocale: undefined,
        })

        // Explicitly publish the document so _status stays 'published'
        await payload.update({
          collection,
          id: row.id,
          data: { _status: 'published' } as any,
          overrideAccess: true,
        })

        console.log(`  ✓ Re-published: [${row.id}] ${row.slug}`)
      } catch (err) {
        console.error(`  ✗ Failed for [${row.id}] ${row.slug}:`, err)
      }
    }
  }

  console.log('\n✅ Done. Check your admin panel now.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
