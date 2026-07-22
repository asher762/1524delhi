'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import type { Header } from '@/payload-types'
import logoWhite from './../../public/logo/white_logo_transparent.svg'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { cn } from '@/utilities/ui'
import Image from 'next/image'

export const HeaderClient: React.FC<{ data: Header }> = ({ data }) => {
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isHome = pathname === '/'
  const heroVisible = isHome && !scrolled

  useEffect(() => {
    setHeaderTheme(null)
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const closeDrawer = () => setDrawerOpen(false)
  const openDrawer = () => setDrawerOpen(true)

  return (
    <>
      {/* Desktop — Hero (homepage, pre-scroll): centered logo + spread nav */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 hidden flex-col items-center px-8 pt-7 pb-6 transition-opacity duration-500 lg:flex',
          heroVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <Link href="/" className="mb-6 block transition-opacity hover:opacity-80">
          <Image
            src={logoWhite}
            alt="logo"
            width={150}
            height={50}
            className="h-14 w-auto text-white"
          />
        </Link>
        <HeaderNav data={data} variant="hero" />
      </header>

      {/* Desktop Compact (scrolled / inner pages): dark logo block + light bar */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 hidden h-16 transition-all duration-500 lg:flex',
          !heroVisible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-3 opacity-0',
        )}
      >
        <Link
          href="/"
          aria-label="Home"
          className="flex w-28 shrink-0 items-center justify-center bg-card transition-opacity hover:opacity-80"
        >
          <Logo className="text-primary-foreground" />
        </Link>
        <div className="flex flex-1 items-center justify-between border-b border-border bg-card px-10 ">
          <div className="flex items-center gap-4">
            <button
              onClick={openDrawer}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="nav-drawer"
              className="flex h-9 w-9 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Menu
            </span>
          </div>
          <div>
            <button
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center text-foreground/60 transition-colors hover:text-foreground px-10"
            >
              <Link href="/search" className="flex gap-2">
                <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground">
                  Search
                </span>
                <Search size={17} strokeWidth={1.5} />
              </Link>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: logo left, hamburger right */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 transition-all duration-300 lg:hidden',
          heroVisible ? 'bg-transparent' : 'bg-card',
        )}
      >
        <Link href="/" aria-label="Home">
          {heroVisible ? (
            <Image src={logoWhite} alt="1524 Logo" width={150} height={34} className="h-8 w-auto" />
          ) : (
            <Logo className="h-8 w-auto" />
          )}
        </Link>
        <button
          onClick={openDrawer}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          aria-controls="nav-drawer"
          className={cn(
            'flex h-9 w-9 items-center justify-center transition-colors',
            heroVisible
              ? 'text-white/80 hover:text-white'
              : 'text-foreground/60 hover:text-foreground',
          )}
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </header>

      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300',
          drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Side drawer — slides in from left */}
      <aside
        id="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-y-0 left-0 z-60 flex w-80 max-w-[85vw] flex-col bg-card shadow-xl',
          'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <Link href="/" onClick={closeDrawer}>
            <Logo className="h-9 w-auto text-foreground" />
          </Link>
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <HeaderNav data={data} variant="drawer" onLinkClick={closeDrawer} />
        </div>
        <div className="border-t border-border px-6 py-5">
          <button className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground">
            <Link href="/search" className="flex gap-2 ">
              <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground">
                Search
              </span>
              <Search size={17} strokeWidth={1.5} />
            </Link>
          </button>
        </div>
      </aside>
    </>
  )
}
