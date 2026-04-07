'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { cn } from '@/utilities/ui'

interface HeaderClientProps {
  data: Header
}

// Extracted to avoid triplicating Logo markup across desktop/mobile/drawer
const LogoLink = ({ onClick, logoClassName }: { onClick?: () => void; logoClassName?: string }) => (
  <Link href="/" onClick={onClick}>
    <Logo loading="eager" priority="high" className={cn('invert dark:invert-0', logoClassName)} />
  </Link>
)

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [scrolledMore, setScrolledMore] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Reset theme + close drawer on route change (merged from two separate effects)
  useEffect(() => {
    setHeaderTheme(null)
    setDrawerOpen(false)
  }, [pathname, setHeaderTheme])

  // Sync theme from context
  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  // Scroll threshold tracking
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 100)
      setScrolledMore(y > 500)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when drawer is open; cleanup always resets
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <>
      <header className="fixed z-20 w-full" data-theme={theme ?? undefined}>
        {/* Desktop: Expanded header — slides up and hides on scroll */}
        <div
          className={cn(
            'px-4 lg:px-16 transition-all duration-700 delay-500 flex-col justify-between items-center gap-6 py-8',
            'hidden lg:flex',
            scrolled && '-mt-[25vh]',
            scrolledMore && 'hidden!',
          )}
        >
          <LogoLink />
          <HeaderNav data={data} />
        </div>

        {/* Desktop: Compact header — appears after scrolledMore threshold */}
        <div
          className={cn(
            'fixed top-0 left-0 w-full px-4 flex-row justify-between items-center py-2 h-16 z-30',
            'transition-all duration-700 delay-300',
            'hidden lg:flex',
            scrolledMore
              ? 'opacity-100 pointer-events-auto bg-background translate-y-0'
              : 'opacity-0 pointer-events-none -translate-y-10',
          )}
        >
          <LogoLink />
          <HeaderNav data={data} />
        </div>

        {/* Mobile: Always-visible header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-background">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-primary" />
          </button>
          <LogoLink />
          <div className="w-10" aria-hidden="true" /> {/* Spacer for centring logo */}
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-[280px] bg-background z-50 lg:hidden',
          'transition-transform duration-300 ease-in-out',
          'border-r border-border shadow-xl',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <LogoLink onClick={() => setDrawerOpen(false)} logoClassName="h-8" />
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-primary" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <HeaderNav data={data} mobile />
          </nav>
        </div>
      </aside>
    </>
  )
}
