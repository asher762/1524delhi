import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import type { Where } from 'payload'

type Args = {
  searchParams: Promise<{
    q: string
    category?: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query, category } = await searchParamsPromise
  const categoryIds = category ? category.split(',').filter(Boolean) : []
  const payload = await getPayload({ config: configPromise })

  const andConditions: Where[] = []
  if (query) {
    andConditions.push({
      or: [
        { title: { like: query } },
        { 'meta.description': { like: query } },
        { 'meta.title': { like: query } },
        { slug: { like: query } },
      ],
    })
  }
  if (categoryIds.length > 0) {
    andConditions.push({ 'categories.categoryID': { in: categoryIds } })
  }

  const [posts, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'search',
      depth: 1,
      limit: 12,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
      },
      // pagination: false reduces overhead if you don't need totalDocs
      pagination: false,
      ...(andConditions.length > 0 ? { where: { and: andConditions } } : {}),
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      select: {
        title: true,
      },
    }),
  ])

  const categoryOptions = categoriesResult.docs.map((doc) => ({
    value: String(doc.id),
    label: doc.title,
  }))

  return (
    <div className="pt-24 pb-24 mx-5">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-200 mx-auto">
            <Search categories={categoryOptions} />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} showCategoryFilter={false} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Find Your Perfect Escape`,
  }
}
