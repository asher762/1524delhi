import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { selectImageSource } from '@/utilities/selectImageSource'
import { ImageWithLoader } from './ImageWithLoader'

// Delivered quality. 100 disables almost all perceptual optimisation in the
// AVIF/WebP encoders for no visible gain; 85 is visually indistinguishable on
// photographic content at a fraction of the bytes. Raise to 90 or 100 here if
// a specific asset needs it — both are allowed by `images.qualities`.
const IMAGE_QUALITY = 85

/**
 * ImageMedia
 *
 * This component passes a **relative** `src` (e.g. `/media/...`) to Next.js Image.
 * The `getMediaUrl` utility constructs the full URL by prepending the base URL from env vars
 * (NEXT_PUBLIC_SERVER_URL). Next.js then optimizes this using `remotePatterns` configured
 * in next.config.js — no custom `loader` needed.
 *
 * Flow:
 *   1. Resource URL from Payload: `/media/image-123.jpg`
 *   2. getMediaUrl() adds base URL: `https://yourdomain.com/media/image-123.jpg`
 *   3. Next.js Image optimizes via remotePatterns: `/_next/image?url=...&w=1200&q=75`
 *
 * If your storage/plugin returns **external CDN URLs** (e.g. `https://cdn.example.com/...`),
 * choose ONE of the following:
 *   A) Allow the remote host in next.config.js:
 *      images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }] }
 *   B) Provide a **custom loader** for CDN-specific transforms:
 *      const imageLoader: ImageLoader = ({ src, width, quality }) =>
 *        `https://cdn.example.com${src}?w=${width}&q=${quality ?? 75}`
 *      <Image loader={imageLoader} src="/media/hero.jpg" width={1200} height={600} alt="" />
 *   C) Skip optimization:
 *      <Image unoptimized src="https://cdn.example.com/hero.jpg" width={1200} height={600} alt="" />
 *
 * TL;DR: Template uses relative URLs + getMediaUrl() to construct full URLs, then relies on
 * remotePatterns for optimization. Only add `loader` if using external CDNs with custom transforms.
 */

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  // NOTE: this is used by the browser to determine which image to download at
  // different screen sizes. The previous default emitted srcset-style `w`
  // descriptors (e.g. `(max-width: 1920px) 3840w`), which are not valid in a
  // `sizes` attribute — every entry was discarded and the browser silently fell
  // back to 100vw. `100vw` is now stated explicitly (identical behaviour, no
  // longer accidental); any call site rendering into a narrower slot should
  // pass an explicit `size`.
  const sizes = sizeFromProps ?? '100vw'

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    // Prefer the smallest pre-generated variant that's still big enough for
    // how this image is actually rendered (see selectImageSource) — falls
    // back to the full-resolution original when no variant is large enough
    // (e.g. a full-bleed hero) or the resource has no generated sizes.
    const resolvedUrl = selectImageSource(resource, sizes) ?? url

    src = getMediaUrl(resolvedUrl, cacheTag)
  }

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  return (
    // `relative` unconditionally (not only when `fill`) so the loading
    // spinner in ImageWithLoader has a positioning context in both modes.
    <picture className={cn('relative', fill && 'block w-full h-full', pictureClassName)}>
      <ImageWithLoader
        alt={alt || ''}
        className={cn(imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        priority={priority}
        quality={IMAGE_QUALITY}
        loading={loading}
        sizes={sizes}
        src={src}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
