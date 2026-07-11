'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { Page } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = {
  blocks?: Page['layout'][0][] | any[]
}

export const BlockBreadcrumbs: React.FC<Props> = ({ blocks }) => {
  const [activeId, setActiveId] = useState<string>('')
  const isScrollingRef = useRef(false)

  if (!blocks || !Array.isArray(blocks)) return null

  const breadcrumbs = blocks
    .filter((block) => block.blockName)
    .map((block) => ({
      name: block.blockName,
      id: block
        .blockName!.replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase(),
    }))

  if (breadcrumbs.length === 0) return null

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Ignore observer updates while a click-triggered scroll is in progress
        if (isScrollingRef.current) return
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' },
    )

    breadcrumbs.forEach((bc) => {
      const el = document.getElementById(bc.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [breadcrumbs])

  const scrollToId = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActiveId(id) // update immediately on click
    isScrollingRef.current = true
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 200 // offset for header
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
    // Re-enable observer updates after smooth scroll completes (~1s)
    setTimeout(() => {
      isScrollingRef.current = false
    }, 1000)
  }

  return (
    <div className="sticky top-14 lg:top-16 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300">
      <div className="container py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className="flex items-center gap-2 whitespace-nowrap">
          {breadcrumbs.map((bc) => (
            <a
              key={bc.id}
              href={`#${bc.id}`}
              onClick={(e) => scrollToId(e, bc.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-sans tracking-[0.1em] uppercase transition-colors cursor-pointer',
                activeId === bc.id
                  ? 'bg-foreground text-background font-semibold'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {bc.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
