'use client'
import { cn } from '@/utilities/ui'
import React, { useState, useEffect } from 'react'

import { Card, CardPostData } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import { CardsCarousel } from './CardsCarousel'
import { FullScreenCarousel } from './FullScreenCarousel'
import { ListView } from './ListView'

export type Props = {
  posts: CardPostData[]
  relationTo?: string
  layout?: 'Grid' | 'FullScreenCarousel' | 'CardsCarousel' | 'List' | string
  enablePagination?: boolean
  limit?: number
  totalPages?: number
  page?: number
  totalDocs?: number
  categories?: (string | number)[]
  populateBy?: 'collection' | 'selection'
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const {
    posts: initialPosts,
    relationTo,
    layout = 'Grid',
    enablePagination = false,
    limit = 12,
    totalPages: initialTotalPages = 1,
    page: initialPage = 1,
    categories,
    populateBy = 'collection',
  } = props

  const [displayedPosts, setDisplayedPosts] = useState<CardPostData[]>(initialPosts)
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setDisplayedPosts(initialPosts)
    setCurrentPage(initialPage)
    setTotalPages(initialTotalPages)
  }, [initialPosts, initialPage, initialTotalPages])

  if (!initialPosts || initialPosts.length === 0) return null

  if (layout === 'FullScreenCarousel') {
    return <FullScreenCarousel posts={initialPosts} relationTo={relationTo} />
  }

  if (layout === 'CardsCarousel') {
    return <CardsCarousel posts={initialPosts} relationTo={relationTo} />
  }

  const isPaginationActive = enablePagination && totalPages > 1

  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isLoading) return

    if (populateBy === 'selection') {
      setCurrentPage(newPage)
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', String(limit))
      params.append('page', String(newPage))
      params.append('depth', '1')
      if (categories && categories.length > 0) {
        categories.forEach((catId, idx) => {
          params.append(`where[categories][in][${idx}]`, String(catId))
        })
      }

      const response = await fetch(`/api/${relationTo || 'posts'}?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (data?.docs) {
          setDisplayedPosts(data.docs)
          setCurrentPage(data.page || newPage)
          if (data.totalPages) setTotalPages(data.totalPages)
        }
      }
    } catch (err) {
      console.error('Failed to fetch paginated archive page:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const postsToRender =
    populateBy === 'selection' && isPaginationActive
      ? displayedPosts.slice((currentPage - 1) * limit, currentPage * limit)
      : displayedPosts

  if (layout === 'List') {
    return (
      <div className={cn('transition-opacity duration-200', isLoading && 'opacity-50 pointer-events-none')}>
        <ListView posts={postsToRender} relationTo={relationTo} />
        {isPaginationActive && (
          <div className="container">
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('transition-opacity duration-200', isLoading && 'opacity-50 pointer-events-none')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {postsToRender?.map((result, index) => {
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
      {isPaginationActive && (
        <div className="container">
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
