'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEnquiry } from '@/providers/Enquiry'
import React, { useEffect } from 'react'

const PageClient: React.FC<{ title?: string }> = ({ title }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const { setEnquiry } = useEnquiry()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  useEffect(() => {
    if (title) setEnquiry({ section: 'hotels', item: title })
  }, [title, setEnquiry])

  return <React.Fragment />
}

export default PageClient
