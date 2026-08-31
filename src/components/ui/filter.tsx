'use client'

import { cn } from '@/utilities/ui'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

export type FilterOption = {
  value: string
  label: string
}

type FilterProps = {
  options: FilterOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  clearLabel?: string
  className?: string
}

export const Filter: React.FC<FilterProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Filter',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  clearLabel = 'Clear selection',
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)

  const buttonLabel =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels.length} selected`

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return options
    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
  }, [options, query])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus()
    } else {
      setQuery('')
    }
  }, [open])

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((selected) => selected !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  if (!options.length) return null

  return (
    <div className={cn('relative inline-block w-full max-w-xs', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-11 w-full items-center justify-between gap-2 rounded-none border border-input bg-background/60 px-4 py-2.5 text-base md:text-sm text-foreground transition-all duration-200 shadow-xs focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
      >
        <span className={cn('truncate', selectedLabels.length === 0 && 'text-muted-foreground')}>
          {buttonLabel}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selectedLabels.length > 0 && (
            <X
              className="size-4 opacity-50 hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation()
                onChange([])
              }}
            />
          )}
          <ChevronDown className={cn('size-4 opacity-50 transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-56 overflow-hidden rounded-none border border-input bg-popover text-popover-foreground shadow-md">
          <div className="relative border-b border-input">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <ul role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto p-1">
            {filteredOptions.map((option) => {
              const isSelected = value.includes(option.value)
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'font-medium',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-sm border border-input',
                        isSelected && 'border-primary bg-primary text-primary-foreground',
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              )
            })}
            {filteredOptions.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
            )}
          </ul>
          {value.length > 0 && (
            <div className="border-t border-input p-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {clearLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
