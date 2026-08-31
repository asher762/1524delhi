import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { NewsletterEmbed } from '@/components/NewsletterEmbed'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const newsletters = await payload.find({
    collection: 'newsletters',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return newsletters.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function NewsletterPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/newsletters/' + decodedSlug
  const newsletter = await queryNewsletterBySlug({ slug: decodedSlug })

  if (!newsletter) return <PayloadRedirects url={url} />

  return (
    <article className="pt-24 pb-16">
      <PageClient title={newsletter.title} />

      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="container mb-8 mt-25">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{newsletter.title}</h1>
          {newsletter.sentAt && (
            <p className="text-sm text-muted-foreground">
              {new Date(newsletter.sentAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>

      <div className="container">
        {newsletter.contentHtml ? (
          <NewsletterEmbed html={newsletter.contentHtml} title={newsletter.title} />
        ) : (
          <p>This newsletter isn&apos;t available right now.</p>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const newsletter = await queryNewsletterBySlug({ slug: decodedSlug })

  return generateMeta({
    doc: newsletter
      ? ({
          slug: newsletter.slug,
          meta: {
            title: newsletter.title,
            description: newsletter.previewText,
          },
        } as any)
      : null,
  })
}

const queryNewsletterBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'newsletters',
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
