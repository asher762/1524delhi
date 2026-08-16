/**
 * One-time utility: uploads every file in public/media to Vercel Blob storage
 * using the exact same filename (no folder prefix, no random suffix), so the
 * existing `media` table's filenames/urls resolve correctly against blob storage.
 *
 * Run with:  npx tsx scripts/upload-media.ts
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

const MEDIA_DIR = path.resolve(process.cwd(), 'public/media')
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const CONCURRENCY = 10

if (!TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN not set')
  process.exit(1)
}

async function uploadOne(filename: string) {
  const filePath = path.join(MEDIA_DIR, filename)
  const buffer = fs.readFileSync(filePath)
  await put(filename, buffer, {
    access: 'public',
    token: TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

async function main() {
  const files = fs.readdirSync(MEDIA_DIR).filter((f) => fs.statSync(path.join(MEDIA_DIR, f)).isFile())
  console.log(`Found ${files.length} files to upload`)

  let done = 0
  let failed: string[] = []

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (f) => {
        try {
          await uploadOne(f)
          done++
        } catch (err) {
          failed.push(f)
          console.error(`FAILED: ${f}`, err instanceof Error ? err.message : err)
        }
      }),
    )
    console.log(`Progress: ${Math.min(i + CONCURRENCY, files.length)}/${files.length}`)
  }

  console.log(`\nDone. Uploaded: ${done}, Failed: ${failed.length}`)
  if (failed.length) {
    console.log('Failed files:', failed)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
