'use client'

import React, { createContext, useCallback, use, useState } from 'react'

/**
 * The Payload field `name` the CollectionEnquiry form field must be configured
 * with (Contact form -> Collection Enquiry field -> "Name"). The Header CTA
 * button and Footer enquire link use this same string to build the query
 * params that field reads on mount (`?collectionEnquiry=<section>&collectionEnquiryItem=<title>`).
 */
export const ENQUIRY_FIELD_NAME = 'collectionEnquiry'

export interface EnquiryContextValue {
  /** matches an EnquirySection `value`, e.g. 'hotels' or 'category:offers' */
  section?: string
  /** the item's title, e.g. 'The Strand Yangon' */
  item?: string
}

export interface EnquiryContextType {
  enquiry: EnquiryContextValue
  setEnquiry: (value: EnquiryContextValue) => void
}

const initialContext: EnquiryContextType = {
  enquiry: {},
  setEnquiry: () => null,
}

const EnquiryContext = createContext(initialContext)

export const EnquiryProvider = ({ children }: { children: React.ReactNode }) => {
  const [enquiry, setEnquiryState] = useState<EnquiryContextValue>({})

  const setEnquiry = useCallback((value: EnquiryContextValue) => {
    setEnquiryState(value)
  }, [])

  return <EnquiryContext value={{ enquiry, setEnquiry }}>{children}</EnquiryContext>
}

export const useEnquiry = (): EnquiryContextType => use(EnquiryContext)

/** Appends the current enquiry context to an internal href, no-op for mailto/tel/external links. */
export const withEnquiryParams = (href: string, enquiry: EnquiryContextValue): string => {
  if (!href.startsWith('/') || !enquiry.section) return href

  const [path, existingQuery] = href.split('?')
  const params = new URLSearchParams(existingQuery)
  params.set(ENQUIRY_FIELD_NAME, enquiry.section)
  if (enquiry.item) params.set(`${ENQUIRY_FIELD_NAME}Item`, enquiry.item)

  return `${path}?${params.toString()}`
}
