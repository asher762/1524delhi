'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Header as HeaderType } from '@/payload-types'
import { useEnquiry, withEnquiryParams } from '@/providers/Enquiry'
import { cn } from '@/utilities/ui'

type HeaderCTAButtonProps = {
  data: HeaderType
  /** `dark` = sitting on a transparent/image backdrop (hero), `light` = sitting on the card bar */
  theme?: 'dark' | 'light'
  className?: string
}

export const HeaderCTAButton: React.FC<HeaderCTAButtonProps> = ({
  data,
  theme = 'light',
  className,
}) => {
  const cta = data?.cta
  const link = cta?.link
  const { enquiry } = useEnquiry()

  if (!cta?.enableCTA || !link) return null

  const rawHref =
    link.type === 'reference' && typeof link.reference?.value === 'object' && link.reference.value?.slug
      ? `${link.reference?.relationTo !== 'pages' ? `/${link.reference.relationTo}` : ''}/${link.reference.value.slug}`
      : link.url

  if (!rawHref) return null

  const href = withEnquiryParams(rawHref, enquiry)

  const newTabProps = link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  return (
    <Link
      href={href}
      {...newTabProps}
      className={cn(
        'group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.32em] transition-all duration-300 sm:px-5',
        theme === 'light'
          ? 'border-white/40 bg-white/0 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-foreground'
          : 'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        className,
      )}
    >
      <span>{link.label}</span>
      <ArrowUpRight
        size={13}
        strokeWidth={1.75}
        className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  )
}
