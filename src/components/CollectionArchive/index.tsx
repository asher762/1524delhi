'use client'
import { cn } from '@/utilities/ui'
import React, { useState, useEffect, useMemo } from 'react'

import { Card, CardPostData } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import { Filter, type FilterOption } from '@/components/ui/filter'
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
  countries?: (string | number)[]
  populateBy?: 'collection' | 'selection'
  showCategoryFilter?: boolean
  showCountryFilter?: boolean
}

// Post categories/countries can arrive either as populated relationship docs
// ({ id, title }) or, from the `search` collection, as denormalized entries
// ({ categoryID | countryID, title }).
const getIdentity = (item: unknown, idKey: 'categoryID' | 'countryID'): FilterOption | null => {
  if (!item || typeof item !== 'object') return null
  const { id, [idKey]: denormalizedId, title } = item as Record<string, unknown>
  const identityId = denormalizedId ?? id
  if (!identityId || !title) return null
  return { value: String(identityId), label: String(title) }
}

const getCategoryIdentity = (category: unknown): FilterOption | null =>
  getIdentity(category, 'categoryID')

const getCountryIdentity = (country: unknown): FilterOption | null =>
  getIdentity(country, 'countryID')

const postMatchesFilter = (
  items: unknown,
  selectedIds: string[],
  getIdentityFn: (item: unknown) => FilterOption | null,
): boolean => {
  if (selectedIds.length === 0) return true
  if (!Array.isArray(items)) return false
  return items.some((item) => {
    const identity = getIdentityFn(item)
    return identity ? selectedIds.includes(identity.value) : false
  })
}

const collectOptions = (
  posts: CardPostData[],
  field: string,
  getIdentityFn: (item: unknown) => FilterOption | null,
): FilterOption[] => {
  const map = new Map<string, string>()
  ;(posts || []).forEach((post) => {
    if (!Array.isArray(post?.[field])) return
    post[field].forEach((item: unknown) => {
      const identity = getIdentityFn(item)
      if (identity && !map.has(identity.value)) {
        map.set(identity.value, identity.label)
      }
    })
  })
  return Array.from(map, ([value, label]) => ({ value, label }))
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
    countries,
    populateBy = 'collection',
    showCategoryFilter = true,
    showCountryFilter = true,
  } = props

  const [displayedPosts, setDisplayedPosts] = useState<CardPostData[]>(initialPosts)
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  useEffect(() => {
    setDisplayedPosts(initialPosts)
    setCurrentPage(initialPage)
    setTotalPages(initialTotalPages)
    setSelectedCategories([])
    setSelectedCountries([])
  }, [initialPosts, initialPage, initialTotalPages])

  const categoryOptions = useMemo<FilterOption[]>(
    () => collectOptions(initialPosts, 'categories', getCategoryIdentity),
    [initialPosts],
  )

  const countryOptions = useMemo<FilterOption[]>(
    () => collectOptions(initialPosts, 'country', getCountryIdentity),
    [initialPosts],
  )

  const fetchPosts = async (newPage: number, categoryIds: string[], countryIds: string[]) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', String(limit))
      params.append('page', String(newPage))
      params.append('depth', '1')

      const effectiveCategoryIds =
        categoryIds.length > 0 ? categoryIds : categories ? categories.map(String) : []
      const effectiveCountryIds =
        countryIds.length > 0 ? countryIds : countries ? countries.map(String) : []

      effectiveCategoryIds.forEach((catId, idx) => {
        params.append(`where[categories][in][${idx}]`, catId)
      })
      effectiveCountryIds.forEach((countryId, idx) => {
        params.append(`where[country][in][${idx}]`, countryId)
      })

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
      console.error('Failed to fetch archive page:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!initialPosts || initialPosts.length === 0) return null

  if (layout === 'FullScreenCarousel') {
    return <FullScreenCarousel posts={initialPosts} relationTo={relationTo} />
  }

  if (layout === 'CardsCarousel') {
    return <CardsCarousel posts={initialPosts} relationTo={relationTo} />
  }

  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isLoading) return

    if (populateBy === 'selection') {
      setCurrentPage(newPage)
      return
    }

    await fetchPosts(newPage, selectedCategories, selectedCountries)
  }

  const handleCategoryChange = async (categoryIds: string[]) => {
    if (isLoading) return
    setSelectedCategories(categoryIds)

    if (populateBy === 'collection' && enablePagination) {
      await fetchPosts(1, categoryIds, selectedCountries)
    } else {
      setCurrentPage(1)
    }
  }

  const handleCountryChange = async (countryIds: string[]) => {
    if (isLoading) return
    setSelectedCountries(countryIds)

    if (populateBy === 'collection' && enablePagination) {
      await fetchPosts(1, selectedCategories, countryIds)
    } else {
      setCurrentPage(1)
    }
  }

  // For server-fetched pages, filtering already happened via the API request above,
  // so this is a no-op there and only does real work for client-held post lists.
  const filteredPosts = displayedPosts.filter(
    (post) =>
      postMatchesFilter(post?.categories, selectedCategories, getCategoryIdentity) &&
      postMatchesFilter(post?.country, selectedCountries, getCountryIdentity),
  )

  const effectiveTotalPages =
    populateBy === 'selection' ? Math.max(1, Math.ceil(filteredPosts.length / limit)) : totalPages

  const isPaginationActive = enablePagination && effectiveTotalPages > 1

  const postsToRender =
    populateBy === 'selection' && isPaginationActive
      ? filteredPosts.slice((currentPage - 1) * limit, currentPage * limit)
      : filteredPosts

  const showCategories = showCategoryFilter && categoryOptions.length > 1
  const showCountries = showCountryFilter && countryOptions.length > 1

  const filterUI = (showCategories || showCountries) && (
    <div className="mb-6 flex flex-col sm:flex-row gap-3">
      {showCategories && (
        <Filter
          options={categoryOptions}
          value={selectedCategories}
          onChange={handleCategoryChange}
          placeholder="All categories"
          searchPlaceholder="Search categories..."
          clearLabel="Clear categories"
        />
      )}
      {showCountries && (
        <Filter
          options={countryOptions}
          value={selectedCountries}
          onChange={handleCountryChange}
          placeholder="All countries"
          searchPlaceholder="Search countries..."
          clearLabel="Clear countries"
        />
      )}
    </div>
  )

  if (layout === 'List') {
    return (
      <div className={cn('transition-opacity duration-200', isLoading && 'opacity-50 pointer-events-none')}>
        <div className="max-w-4xl">{filterUI}</div>
        <ListView posts={postsToRender} relationTo={relationTo} />
        {isPaginationActive && (
          <div className="container">
            <Pagination page={currentPage} totalPages={effectiveTotalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('transition-opacity duration-200', isLoading && 'opacity-50 pointer-events-none')}>
      <div>
        <div className="max-w-4xl">{filterUI}</div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {postsToRender?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card className="h-full" doc={result} relationTo={relationTo}/>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
      {isPaginationActive && (
        <div className="container">
          <Pagination page={currentPage} totalPages={effectiveTotalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
