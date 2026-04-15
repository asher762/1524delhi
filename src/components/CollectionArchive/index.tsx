import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'
import { CardsCarousel } from './CardsCarousel'
import { FullScreenCarousel } from './FullScreenCarousel'
import { ListView } from './ListView'

export type Props = {
  posts: CardPostData[]
  relationTo?: string
  layout?: 'Grid' | 'FullScreenCarousel' | 'CardsCarousel' | 'List' | string
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, relationTo, layout = 'Grid' } = props

  if (!posts || posts.length === 0) return null

  if (layout === 'FullScreenCarousel') {
    return <FullScreenCarousel posts={posts} relationTo={relationTo} />
  }

  if (layout === 'CardsCarousel') {
    return <CardsCarousel posts={posts} relationTo={relationTo} />
  }

  if (layout === 'List') {
    return <ListView posts={posts} relationTo={relationTo} />
  }

  return (
    <div className={cn('')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card className="h-full" doc={result} relationTo={relationTo} showCategories />
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}
