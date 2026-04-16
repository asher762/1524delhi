import React from 'react'

import { Media } from '@/components/Media'

type Category = any

export const CollectionHero: React.FC<{
  doc: {
    title: string
    logoImage?: any
    categories?: Category[]
    heroImage?: any
    publishedAt?: string | null
    location?: string | null
  }
}> = ({ doc }) => {
  const { categories, heroImage, title, location, logoImage } = doc

  // Build the sub-heading: location parts + categories joined with " | "
  const locationParts = location
    ? location
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  const categoryTitles = (categories ?? [])
    .filter((c): c is { title: string } => typeof c === 'object' && c !== null)
    .map((c) => c.title ?? 'Untitled')

  const subheadingParts = [...locationParts, ...categoryTitles]

  return (
    <div className="bg-background pt-24 pb-0">
      {/* ── Top text block ── */}
      <div className="container flex flex-col items-center text-center gap-4 pb-8">
        {/* Logo */}
        {logoImage && typeof logoImage !== 'string' && (
          <div className="relative w-38 h-24 mb-2">
            <Media fill imgClassName="object-contain object-center" resource={logoImage} />
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-5xl lg:text-[3.25rem] leading-tight tracking-tight text-foreground max-w-3xl">
          {title}
        </h1>

        {/* Location / categories */}
        {subheadingParts.length > 0 && (
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mt-1">
            {subheadingParts.join(' \u00a0|\u00a0 ')}
          </p>
        )}
      </div>

      {/* ── Hero image ── */}
      {heroImage && typeof heroImage !== 'string' && (
        <div className="container">
          <div className="relative w-full aspect-video md:aspect-3/2 overflow-hidden">
            <Media fill priority imgClassName="object-cover object-center" resource={heroImage} />
          </div>
        </div>
      )}
    </div>
  )
}
