import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    enablePagination,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    relationTo,
    layout,
  } = props

  const limit = limitFromProps || 12
  const targetCollection = relationTo || 'posts'

  // `pages` is the one selectable target without a `categories` field, so the
  // key is added conditionally rather than blanket-selected.
  const hasCategories = targetCollection !== 'pages'

  // Card / ListView / FullScreenCarousel between them render only these
  // fields. Without an explicit select every document came back in full —
  // including the entire `layout` blocks tree at depth 1, for up to 100 docs.
  const archiveSelect = {
    title: true,
    slug: true,
    meta: {
      image: true,
      description: true,
      title: true,
    },
    ...(hasCategories ? { categories: true } : {}),
  }

  let posts: any[] = []
  let totalPages = 1
  let totalDocs = 0
  let page = 1

  const flattenedCategories = categories?.map((category) => {
    if (typeof category === 'object') return category.id
    else return category
  })

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const isCarousel = layout === 'FullScreenCarousel' || layout === 'CardsCarousel'

    const fetchedPosts = await payload.find({
      collection: targetCollection,
      depth: 1,
      limit: isCarousel ? limitFromProps || 100 : limit,
      overrideAccess: false,
      select: archiveSelect as any,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
    totalPages = fetchedPosts.totalPages
    totalDocs = fetchedPosts.totalDocs
    page = fetchedPosts.page || 1
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as any[]

      posts = filteredSelectedPosts
      totalDocs = posts.length
      totalPages = Math.ceil(posts.length / limit)
    }
  }

  return (
    <div className="container" id={`block-${id}`}>
      {introContent && (
        <div className="mb-8">
          <RichText className="ml-0 mx-0!" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive
        posts={posts}
        relationTo={targetCollection}
        layout={layout || 'Grid'}
        enablePagination={enablePagination ?? true}
        limit={limit}
        totalPages={totalPages}
        page={page}
        totalDocs={totalDocs}
        categories={flattenedCategories}
        populateBy={populateBy || 'collection'}
      />
    </div>
  )
}
