'use client'

import Link from 'next/link'
import React from 'react'

import { useEnquiry, withEnquiryParams } from '@/providers/Enquiry'

export const EnquireLink: React.FC<{ href: string }> = ({ href }) => {
  const { enquiry } = useEnquiry()

  return (
    <Link
      href={withEnquiryParams(href, enquiry)}
      className="flex items-center gap-3 md:gap-4 text-foreground/60 hover:text-foreground transition-colors duration-200 group text-center md:text-left"
    >
      {/* Envelope icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="w-8 h-8 md:w-10 md:h-10 shrink-0"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide">
        Enquire for bookings
      </h1>
    </Link>
  )
}
