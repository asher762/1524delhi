'use client'
import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Card, CardPostData } from '@/components/Card'
import Link from 'next/link'

export const CardsCarousel: React.FC<{
  posts: CardPostData[]
  relationTo?: string
}> = ({ posts, relationTo }) => {
  const [emblaRef] = useEmblaCarousel({ loop: false, align: 'start', dragFree: true })

  return (
    <div className="overflow-hidden w-full" ref={emblaRef}>
      <div className="flex gap-6">
        {posts?.map((result, index) => (
          <div className="flex-[0_0_80%] sm:flex-[0_0_40%] lg:flex-[0_0_30%] min-w-0" key={index}>
            <Card className="h-full" doc={result} relationTo={relationTo} showCategories />
          </div>
        ))}
      </div>
    </div>
  )
}
