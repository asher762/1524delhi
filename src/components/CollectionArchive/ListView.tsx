import React from 'react'
import { Card, CardPostData } from '@/components/Card'

import Link from 'next/link'
import { Media } from '@/components/Media'

export const ListView: React.FC<{
  posts: CardPostData[]
  relationTo?: string
}> = ({ posts, relationTo }) => {
  return (
    <div className="container max-w-4xl space-y-4">
      {posts?.map((result, index) => {
        const { slug, title, meta, categories } = result || {}
        const { description, image: metaImage } = meta || {}
        const href = `/${relationTo}/${slug}`
        
        return (
          <Link
            key={index}
            href={href}
            className="group flex flex-row items-center gap-4 sm:gap-6 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors hover:shadow-md"
          >
            {/* Thumbnail Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              {metaImage && typeof metaImage !== 'string' ? (
                <Media 
                  resource={metaImage} 
                  size="10vw" 
                  fill
                  imgClassName="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
                />
              ) : (
                <span className="text-xs text-muted-foreground">No image</span>
              )}
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-grow py-1">
              {categories && Array.isArray(categories) && categories.length > 0 && (
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {categories.map((c: any) => typeof c === 'object' ? c.title : '').filter(Boolean).join(', ')}
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description.replace(/\s/g, ' ')}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
