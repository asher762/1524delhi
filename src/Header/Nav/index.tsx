'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

interface HeaderNavProps {
  data: HeaderType
  variant?: 'hero' | 'drawer'
  onLinkClick?: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, variant = 'hero', onLinkClick }) => {
  const navItems = data?.navItems || []

  if (variant === 'drawer') {
    return (
      <nav>
        <ul role="list" className="flex flex-col">
          {navItems.map(({ link }, i) => (
            <li key={i} className="border-b border-border last:border-b-0 ">
              <CMSLink
                {...link}
                onClick={onLinkClick}
                className="block py-5 font-sans text-sm uppercase tracking-[0.3em] text-foreground/70 transition-colors hover:text-foreground"
              />
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <nav className="flex items-center justify-center gap-8 xl:gap-12">
      {navItems.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          className="whitespace-nowrap font-sans text-[10px] uppercase tracking-[0.32em] text-white/80 transition-colors hover:text-white"
        />
      ))}
    </nav>
  )
}
