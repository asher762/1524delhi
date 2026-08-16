'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, type FilterOption } from '@/components/ui/filter'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

type SearchProps = {
  categories?: FilterOption[]
}

export const Search: React.FC<SearchProps> = ({ categories = [] }) => {
  const [value, setValue] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const router = useRouter()

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedValue) params.set('q', debouncedValue)
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
    const queryString = params.toString()
    router.push(`/search${queryString ? `?${queryString}` : ''}`)
  }, [debouncedValue, selectedCategories, router])

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center">
      <form
        className="flex-1"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Search"
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
      {categories.length > 0 && (
        <Filter
          options={categories}
          value={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="All categories"
          searchPlaceholder="Search categories..."
          clearLabel="Clear categories"
          className="sm:w-56"
        />
      )}
    </div>
  )
}
