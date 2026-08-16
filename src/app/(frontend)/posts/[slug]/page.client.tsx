'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEnquiry } from '@/providers/Enquiry'
import React, { useEffect } from 'react'

const PageClient: React.FC<{ title?: string; categorySlug?: string }> = ({
  title,
  categorySlug,
}) => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const { setEnquiry } = useEnquiry()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  useEffect(() => {
    if (title && categorySlug) setEnquiry({ section: `category:${categorySlug}`, item: title })
  }, [title, categorySlug, setEnquiry])

  return <React.Fragment />
}

export default PageClient
