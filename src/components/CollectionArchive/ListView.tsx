import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { CardPostData } from '@/components/Card'

export const ListView: React.FC<{
  posts: CardPostData[]
  relationTo?: string
}> = ({ posts, relationTo }) => {
  if (!posts?.length) {
    return (
      <div className="container max-w-4xl py-16 flex flex-col items-center text-center">
        <p className="text-muted-foreground text-sm">No posts found.</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl min-h-1/3">
      <ul role="list" className="divide-y divide-border">
        {posts.map((result, index) => {
          if (!result) return null

          const { slug, title, meta, categories, thumbnailUrl, previewText } = result
          const { description = previewText, image: metaImage = thumbnailUrl } = meta || {}
          // `result.doc` is the polymorphic relationship the `search` collection stores
          // (search results can come from hotels, experiences, journeys, etc.), used
          // as a fallback when the caller doesn't already know a single relationTo.
          const resolvedRelationTo = relationTo || result?.doc?.relationTo
          const href =
            resolvedRelationTo === 'pages' || !resolvedRelationTo
              ? `/${slug}`
              : `/${resolvedRelationTo}/${slug}`
          const isExternalImageUrl = typeof metaImage === 'string' && /^https?:\/\//.test(metaImage)

          const categoryLabel =
            Array.isArray(categories) && categories.length > 0
              ? categories
                  .map((c: any) => (typeof c === 'object' && c?.title ? c.title : ''))
                  .filter(Boolean)
                  .join(', ')
              : null

          return (
            <li key={index}>
              <Link
                href={href}
                className="group flex flex-row items-stretch gap-0 min-h-33 bg-card hover:bg-muted/50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 my-2"
              >
                {/* Thumbnail */}
                <div className="relative shrink-0 w-24 sm:w-36 md:w-40 aspect-video overflow-hidden bg-muted self-stretch">
                  {metaImage && isExternalImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable source (e.g. Mailchimp's CDN)
                    <img
                      alt={title || ''}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      src={metaImage}
                    />
                  ) : metaImage && typeof metaImage !== 'string' ? (
                    <Media
                      resource={metaImage}
                      size="(max-width: 640px) 96px, (max-width: 768px) 144px, 160px"
                      fill
                      imgClassName="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-xs text-muted-foreground select-none">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center gap-1 grow px-4 py-4 sm:px-5 sm:py-5 min-w-0">
                  {categoryLabel && (
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
                      {categoryLabel}
                    </p>
                  )}

                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold leading-snug line-clamp-2 text-card-foreground group-hover:text-primary transition-colors duration-200">
                    {title}
                  </h3>

                  {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {description.replace(/\s+/g, ' ').trim()}
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="hidden sm:flex items-center pr-4 sm:pr-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors duration-200">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
