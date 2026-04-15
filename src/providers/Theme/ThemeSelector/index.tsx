'use client'

import React, { useEffect } from 'react'

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { useTheme } from '..'

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()

  // Keep ThemeProvider context in sync when the toggler changes the DOM
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [setTheme])

  return <AnimatedThemeToggler />
}
