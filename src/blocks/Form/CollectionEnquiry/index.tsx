'use client'

import type { Control, FieldErrorsImpl, UseFormSetValue } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useEffect, useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'
import { getClientSideURL } from '@/utilities/getURL'
import { enquirySections, type EnquirySection } from './options'

type ItemOption = { label: string; value: string }

export const CollectionEnquiry: React.FC<{
  blockType: 'collectionEnquiry'
  name: string
  label?: string
  required?: boolean
  width?: number
  control: Control
  errors: Partial<FieldErrorsImpl>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
}> = ({ name, control, errors, label, required, width, setValue }) => {
  const itemFieldName = `${name}Item`

  const [sections, setSections] = useState<EnquirySection[]>(enquirySections)
  const [itemOptions, setItemOptions] = useState<ItemOption[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [pendingItemPrefill, setPendingItemPrefill] = useState<string | null>(null)

  const selectedSection = useWatch({ control, name })

  // Categories (Offers, News, ...) are content, not code — fetched live, never hardcoded.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${getClientSideURL()}/api/categories?limit=100&depth=0&sort=title`)
        const data = await res.json()
        const categoryOptions: EnquirySection[] = (data?.docs || []).map(
          (category: { id: string; title: string; slug: string }) => ({
            label: category.title,
            value: `category:${category.slug}`,
            source: 'posts',
            type: 'category' as const,
            categoryId: category.id,
          }),
        )
        setSections([...enquirySections, ...categoryOptions])
      } catch (err) {
        console.warn(err)
      }
    }
    void loadCategories()
  }, [])

  // One-time prefill from ?<name>=<section>&<name>Item=<item title>, e.g. carried
  // over from the Header CTA button or the Footer "Enquire for bookings" link.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const sectionParam = params.get(name)
    const itemParam = params.get(itemFieldName)
    if (!sectionParam && !itemParam) return

    // Deferred a tick: in dev, React Strict Mode double-invokes this mount effect
    // alongside Controller's own field-registration effect, and calling setValue
    // synchronously here races that registration and gets silently overwritten.
    const timer = setTimeout(() => {
      if (sectionParam) setValue(name, sectionParam)
      if (itemParam) setPendingItemPrefill(itemParam)
    }, 0)
    return () => clearTimeout(timer)
    // Only ever runs once, on mount — this is a one-shot deep-link prefill, not a live sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Items always come from the actual collections/posts — never hardcoded, since
  // hotels, experiences, villas, journeys and post content change independently of the code.
  useEffect(() => {
    const section = sections.find((s) => s.value === selectedSection)
    if (!section) {
      setItemOptions([])
      return
    }

    const loadItems = async () => {
      setItemsLoading(true)
      try {
        const query =
          section.type === 'category'
            ? `where[categories][in]=${section.categoryId}&limit=100&depth=0&sort=title&select[title]=true`
            : `limit=100&depth=0&sort=title&select[title]=true`
        const res = await fetch(`${getClientSideURL()}/api/${section.source}?${query}`)
        const data = await res.json()
        const options: ItemOption[] = (data?.docs || []).map((doc: { title: string }) => ({
          label: doc.title,
          value: doc.title,
        }))
        setItemOptions(options)

        if (pendingItemPrefill && options.some((o) => o.value === pendingItemPrefill)) {
          setValue(itemFieldName, pendingItemPrefill)
          setPendingItemPrefill(null)
        }
      } catch (err) {
        console.warn(err)
        setItemOptions([])
      } finally {
        setItemsLoading(false)
      }
    }
    void loadItems()
  }, [selectedSection, sections, pendingItemPrefill, itemFieldName, setValue])

  return (
    <Width width={width}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label
            htmlFor={name}
            className="mb-2 block text-sm font-semibold tracking-wide text-foreground/90"
          >
            {label || 'What are you enquiring about?'}
            {required && (
              <span className="text-destructive ml-1 font-bold">
                * <span className="sr-only">(required)</span>
              </span>
            )}
          </Label>
          <Controller
            control={control}
            defaultValue=""
            name={name}
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} value={value}>
                <SelectTrigger className="w-full" id={name}>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            rules={{ required }}
          />
          {errors[name] && <Error name={name} />}
        </div>

        <div>
          <Label
            htmlFor={itemFieldName}
            className="mb-2 block text-sm font-semibold tracking-wide text-foreground/90"
          >
            Which one?
          </Label>
          <Controller
            control={control}
            defaultValue=""
            name={itemFieldName}
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} value={value} disabled={!selectedSection || itemsLoading}>
                <SelectTrigger className="w-full" id={itemFieldName}>
                  <SelectValue
                    placeholder={
                      !selectedSection ? 'Choose a section first' : itemsLoading ? 'Loading…' : 'Select an item'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {itemOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </Width>
  )
}
