'use client'

import React, { useCallback, useEffect } from 'react'
import type { CarouselBlock as CarouselBlockProps } from '@/payload-types'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utilities/ui'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

// ─── Types ───────────────────────────────────────────────────────────────────

type Slide = NonNullable<CarouselBlockProps['slides']>[number]

// ─── Full Width Slide ─────────────────────────────────────────────────────────

function FullWidthSlide({ slide, sectionTitle }: { slide: Slide; sectionTitle?: string | null }) {
  const imageUrl = typeof slide.image === 'object' && slide.image ? (slide.image.url ?? '') : ''
  const imageAlt = typeof slide.image === 'object' && slide.image ? (slide.image.alt ?? '') : ''

  return (
    <div className="relative flex-[0_0_100%] min-w-0 h-[520px] md:h-[640px]">
      {imageUrl && <Image src={imageUrl} alt={imageAlt} fill className="object-cover" priority />}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Centered content */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center text-white">
          {sectionTitle && (
            <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-6 drop-shadow-sm text-white/90">
              {sectionTitle}
            </h2>
          )}
          {slide.title && (
            <h3 className="font-serif text-3xl md:text-4xl font-semibold mb-3 drop-shadow-sm">
              {slide.title}
            </h3>
          )}
          {slide.content && (
            <div className="text-white/85 text-sm md:text-base leading-relaxed [&_p]:mb-0 **:text-white/85">
              <RichText data={slide.content as any} enableProse={false} />
            </div>
          )}
          {slide.enableLink && slide.link && (
            <div className="mt-6">
              <CMSLink
                {...slide.link}
                className="inline-block border border-white/70 text-white hover:bg-white hover:text-foreground transition-colors px-6 py-2 text-sm tracking-wide"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Card Slide ───────────────────────────────────────────────────────────────

function CardSlide({ slide }: { slide: Slide }) {
  const imageUrl = typeof slide.image === 'object' && slide.image ? (slide.image.url ?? '') : ''
  const imageAlt = typeof slide.image === 'object' && slide.image ? (slide.image.alt ?? '') : ''

  return (
    <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4">
      <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col group hover:shadow-md transition-shadow duration-300">
        {/* Image */}
        <div className="relative aspect-3/2 overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          {slide.title && (
            <h3 className="font-serif text-lg font-semibold mb-2 text-foreground line-clamp-2">
              {slide.title}
            </h3>
          )}
          {slide.content && (
            <div className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-4 [&_p]:mb-0">
              <RichText data={slide.content as any} enableProse={false} enableGutter={false} />
            </div>
          )}
          {slide.enableLink && slide.link && (
            <div className="mt-4 pt-4 border-t border-border">
              <CMSLink
                {...slide.link}
                className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({ title, mb = 'mb-8' }: { title?: string | null; mb?: string }) {
  if (!title) return null
  return (
    <h2
      className={cn(
        'font-serif text-2xl md:text-3xl font-semibold text-center text-foreground',
        mb,
      )}
    >
      {title}
    </h2>
  )
}

// ─── Dot Controls ─────────────────────────────────────────────────────────────

function Dots({
  snaps,
  selectedIndex,
  onDotClick,
  light = false,
}: {
  snaps: number[]
  selectedIndex: number
  onDotClick: (i: number) => void
  light?: boolean
}) {
  return (
    <div className="flex justify-center gap-1.5">
      {snaps.map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            light
              ? i === selectedIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50'
              : i === selectedIndex
                ? 'w-8 bg-foreground'
                : 'w-2 bg-foreground/25',
          )}
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const CarouselBlock: React.FC<CarouselBlockProps> = ({
  carouselType,
  title,
  slides,
  autoplay,
  autoplaySpeed,
}) => {
  const isFullWidth = carouselType === 'fullWidth'

  const plugins = React.useMemo(
    () =>
      autoplay ? [Autoplay({ delay: (autoplaySpeed ?? 5) * 1000, stopOnInteraction: true })] : [],
    [autoplay, autoplaySpeed],
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: isFullWidth ? 'center' : 'start' },
    plugins,
  )

  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (!slides || slides.length === 0) return null

  // ── Full Width Layout ──────────────────────────────────────────────────────
  if (isFullWidth) {
    return (
      <div className="w-full">
        <div className="relative group overflow-hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((slide, i) => (
                <FullWidthSlide key={i} slide={slide} sectionTitle={title} />
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={scrollPrev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/25 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/25 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots (inside, over the image) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
            <Dots
              snaps={scrollSnaps}
              selectedIndex={selectedIndex}
              onDotClick={(i) => emblaApi?.scrollTo(i)}
              light
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Cards Layout ───────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <SectionTitle title={title} mb="mb-8" />

      <div className="relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 py-2 px-5">
            {slides.map((slide, i) => (
              <CardSlide key={i} slide={slide} />
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={scrollPrev}
          aria-label="Previous"
          className="absolute left-5 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-background border border-border shadow-md rounded-full p-2 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={scrollNext}
          aria-label="Next"
          className="absolute right-5 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-background border border-border shadow-md rounded-full p-2 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-6">
        <Dots
          snaps={scrollSnaps}
          selectedIndex={selectedIndex}
          onDotClick={(i) => emblaApi?.scrollTo(i)}
        />
      </div>
    </div>
  )
}
