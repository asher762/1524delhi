'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface HeaderNavProps {
  data: HeaderType
  mobile?: boolean
}

// Shared base classes for every mobile nav item
const mobileItemBase =
  'px-4 py-3 rounded-md hover:bg-accent transition-colors text-base text-foreground hover:text-primary'

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, mobile = false }) => {
  const navItems = data?.navItems || []

  if (mobile) {
    return (
      <nav className="flex flex-col gap-2">
        {navItems.map(({ link }, i) => (
          <CMSLink key={i} {...link} appearance="link" className={cn('block', mobileItemBase)} />
        ))}
        <Link href="/search" className={cn('flex items-center gap-3', mobileItemBase)}>
          <SearchIcon className="w-5" />
          <span>Search</span>
        </Link>
      </nav>
    )
  }

  return (
    <nav className="flex gap-16 items-center justify-evenly">
      {navItems.map(({ link }, i) => (
        <CMSLink key={i} {...link} appearance="link" />
      ))}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
