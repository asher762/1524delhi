import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'
import { IconBlock } from '../blocks/Icon/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: {
    group: 'Collections',
  },
  access: {
    create: authenticated,
    delete: isAdmin,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            BlocksFeature({ inlineBlocks: [IconBlock] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
  ],
  upload: {
    // Only used when the Vercel Blob adapter is inactive (e.g. local dev with
    // no BLOB_READ_WRITE_TOKEN). In deployed environments the storage adapter
    // supersedes this and files go to Vercel Blob.
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    // Allowlist rather than accept-anything. SVG is deliberately excluded: Blob
    // serves with the uploaded content type, so a stored SVG becomes an
    // attacker-controlled document on a Vercel domain. Add types here (e.g.
    // 'application/pdf') if editors need them.
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
    // NOTE: Payload 3.81 exposes no per-collection max file size (UploadConfig
    // has no `filesize`/`limits` key). The effective ceiling here is Vercel's
    // ~4.5MB request body limit, since clientUploads is not enabled. If that
    // ever changes, enforce a cap via `upload.abortOnLimit`/`limitHandler` on
    // the root config in payload.config.ts.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
