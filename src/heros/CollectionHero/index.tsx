import React from 'react'

import { Media } from '@/components/Media'

export const CollectionHero: React.FC<{
  doc: {
    title: string
    logoImage?: any
    heroImage?: any
    location?: string | null
  }
}> = ({ doc }) => {
  const { heroImage, title, location, logoImage } = doc

  // Build the sub-heading from location parts
  const locationParts = location
    ? location
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

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

        {/* Location */}
        {locationParts.length > 0 && (
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mt-1">
            {locationParts.join('  |  ')}
          </p>
        )}
      </div>

      {/* ── Hero image ── */}
      {heroImage && typeof heroImage !== 'string' && (
        <div className="container">
          <div className="relative w-full aspect-auto md:aspect-3/2 overflow-hidden">
            <Media fill priority imgClassName="object-cover object-center" resource={heroImage} />
          </div>
        </div>
      )}
    </div>
  )
}
