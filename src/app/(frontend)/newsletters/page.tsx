
import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const newsletters = await payload.find({
    collection: 'newsletters',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    sort: '-sentAt',
    select: {
      title: true,
      slug: true,
      thumbnailUrl: true,
      previewText: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Newsletters</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collectionLabels={{ plural: 'Newsletters', singular: 'Newsletter' }}
          currentPage={newsletters.page}
          limit={12}
          totalDocs={newsletters.totalDocs}
        />
      </div>

      <CollectionArchive posts={newsletters.docs} relationTo="newsletters" />

      <div className="container">
        {newsletters.totalPages > 1 && newsletters.page && (
          <Pagination page={newsletters.page} totalPages={newsletters.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `1524 Delhi Newsletters`,
  }
}
