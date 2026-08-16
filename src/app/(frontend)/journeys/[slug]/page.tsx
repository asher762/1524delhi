import type { Metadata } from 'next'

import { RelatedDocs } from '@/blocks/RelatedDocs/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { CollectionHero } from '@/heros/CollectionHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { BlockBreadcrumbs } from '@/components/BlockBreadcrumbs'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const items = await payload.find({
    collection: 'journeys',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = items.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/journeys/' + decodedSlug
  const doc = await queryDocBySlug({ slug: decodedSlug })

  if (!doc) return <PayloadRedirects url={url} />

  let relatedDocs = (doc as any).relatedJourneys

  return (
    <article className="pt-16 pb-16">
      <PageClient title={doc.title} />

      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <BlockBreadcrumbs blocks={doc.layout as any} />

      <CollectionHero doc={doc as any} />

      <div className="pt-8">
        {doc.layout && <RenderBlocks blocks={doc.layout as any} />}
        <div className="container">
          {relatedDocs && relatedDocs.length > 0 && (
            <RelatedDocs
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={relatedDocs}
              relationTo="journeys"
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const doc = await queryDocBySlug({ slug: decodedSlug })

  return generateMeta({ doc: doc as any })
}

const queryDocBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'journeys',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
