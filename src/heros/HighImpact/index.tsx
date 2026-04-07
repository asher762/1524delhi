'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

type Slide = {
  richText?: Page['hero']['richText']
  links?: Page['hero']['links']
  media?: Page['hero']['media']
}

type Props = Slide & { slides?: Slide[] }

export const HighImpactHero: React.FC<Props> = ({ slides, richText, links, media }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const parallaxEls = useRef<(HTMLDivElement | null)[]>([])

  const normalized: Slide[] = slides?.length ? slides : [{ richText, links, media }]

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const applyParallax = useCallback(() => {
    if (!api) return
    const progress = api.scrollProgress()
    api.scrollSnapList().forEach((snap, i) => {
      const el = parallaxEls.current[i]
      if (el) el.style.transform = `translateX(${(snap - progress) * 40}%)`
    })
  }, [api])

  useEffect(() => {
    if (!api) return
    api.on('scroll', applyParallax)
    api.on('reInit', applyParallax)
    api.on('select', () => setSelectedIndex(api.selectedScrollSnap()))
    applyParallax()
    return () => {
      api.off('scroll', applyParallax)
      api.off('reInit', applyParallax)
    }
  }, [api, applyParallax])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, duration: 30 }}
        // [&>div] targets the internal overflow-hidden Embla viewport wrapper
        className="h-full w-full [&>div]:h-full"
      >
        {/* ml-0 / pl-0 remove shadcn's default negative-margin gutter */}
        <CarouselContent className="ml-0 h-full touch-pan-y">
          {normalized.map((slide, i) => (
            <CarouselItem key={i} className="relative h-full pl-0">
              {slide.media && typeof slide.media === 'object' && (
                <div
                  ref={(el) => {
                    parallaxEls.current[i] = el
                  }}
                  className="absolute inset-0 will-change-transform"
                  style={{ width: 'calc(100% + 6%)', left: '-3%' }}
                >
                  <Media
                    fill
                    imgClassName="object-cover"
                    priority={i === 0}
                    resource={slide.media}
                  />
                  <div className="absolute inset-0 bg-black/45" />
                </div>
              )}
              <div className="container relative z-10 flex h-full flex-col items-center justify-center gap-6 text-center text-white">
                {slide.richText && (
                  <div className="max-w-3xl">
                    <RichText data={slide.richText} enableGutter={false} />
                  </div>
                )}
                {Array.isArray(slide.links) && slide.links.length > 0 && (
                  <ul className="flex flex-wrap justify-center gap-4">
                    {slide.links.map(({ link }, j) => (
                      <li key={j}>
                        <CMSLink {...link} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* shadcn default is -left-12 / -right-12 (outside); left-4/right-4 moves them inside */}
        <CarouselPrevious className="left-4 z-20 border-none bg-white/10 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white" />
        <CarouselNext className="right-4 z-20 border-none bg-white/10 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white" />

        {normalized.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {normalized.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  )
}
