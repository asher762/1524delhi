'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = any // Relaxing type to accommodate Hotels, Experiences etc which share structure

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: string
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, thumbnailUrl, previewText } = doc || {}
  const { description = previewText, image: metaImage = thumbnailUrl } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = relationTo === 'pages' ? `/${slug}` : `/${relationTo}/${slug}`
  const isExternalImageUrl = typeof metaImage === 'string' && /^https?:\/\//.test(metaImage)

  return (
    <article
      className={cn(
        'group relative overflow-hidden bg-background hover:cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-muted">
        {!metaImage && (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {metaImage && isExternalImageUrl && (
          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable source (e.g. Mailchimp's CDN) */}
            <img
              alt={titleToUse || ''}
              className="object-cover w-full h-full"
              loading="lazy"
              src={metaImage}
            />
          </div>
        )}
        {metaImage && !isExternalImageUrl && typeof metaImage !== 'string' && (
          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
            {/* Grid is 4/4 cols on mobile, 4/8 at sm, 4/12 at lg — so the card
                occupies 100vw / 50vw / 33vw respectively. */}
            <Media
              resource={metaImage}
              size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              fill
              imgClassName="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white flex flex-col justify-end">
        {showCategories && hasCategories && (
          <div className="uppercase text-xs font-semibold tracking-wider mb-2 text-white/80">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <div className="prose prose-invert border-none">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
              <Link
                className="not-prose text-white hover:text-white/90 transition-colors before:absolute before:inset-0"
                href={href}
                ref={link.ref}
              >
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && (
          <div className="mt-2 line-clamp-2 text-sm text-white/70">
            {description && <p className="m-0">{sanitizedDescription}</p>}
          </div>
        )}
      </div>
    </article>
  )
}
