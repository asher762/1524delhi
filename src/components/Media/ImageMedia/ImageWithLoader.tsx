'use client'

import type { StaticImageData } from 'next/image'

import NextImage from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  alt: string
  className?: string
  fill?: boolean
  height?: number
  loading?: 'lazy' | 'eager'
  priority?: boolean
  quality: number
  sizes: string
  src: StaticImageData | string
  width?: number
}

/**
 * Thin client boundary around next/image so the surrounding ImageMedia can
 * stay a server component. Replaces the flat grey blur placeholder with a
 * small spinner that disappears once the image has actually painted.
 */
export const ImageWithLoader: React.FC<Props> = (props) => {
  const { className, ...imageProps } = props
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // If the browser already finished loading this image before React
    // attached the onLoad listener (e.g. served from cache, or hydrating
    // over SSR'd markup for an image already in the viewport), `onLoad`
    // never fires again — check the already-resolved state directly so the
    // spinner doesn't get stuck.
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  return (
    <>
      <NextImage
        {...imageProps}
        ref={imgRef}
        className={cn(className, 'transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-muted-foreground" />
        </span>
      )}
    </>
  )
}
