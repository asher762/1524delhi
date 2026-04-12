'use client'
import React, { useEffect, useState, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { CardPostData } from '@/components/Card'
import { Media } from '@/components/Media'
import Link from 'next/link'

const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

export const FullScreenCarousel: React.FC<{
  posts: CardPostData[]
  relationTo?: string
}> = ({ posts, relationTo }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="relative my-16 mx-4 sm:mx-8 lg:mx-16 xl:mx-24 rounded-2xl overflow-hidden shadow-2xl bg-black text-white">
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {posts?.map((result, index) => {
            const { slug, title, meta } = result
            const { description, image } = meta || {}
            const isActive = index === selectedIndex

            return (
              <div
                className="flex-[0_0_100%] min-w-0 relative h-[70vh] sm:h-[85vh] overflow-hidden"
                key={index}
              >
                {/* Background image with zoom */}
                {image && typeof image !== 'string' && (
                  <div
                    className={`absolute inset-0 w-full h-full transition-transform duration-1200 ease-in-out ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                  >
                    <Media
                      resource={image}
                      fill
                      imgClassName="object-cover absolute inset-0 w-full h-full rounded-2xl"
                    />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />

                {/* Subtle top vignette for logo breathing room */}
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent z-10" />

                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end px-8 sm:px-16 lg:px-24 pb-20 sm:pb-28">
                  <div
                    className={`max-w-3xl transform transition-all duration-700 delay-150 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                  >
                    {/* Eyebrow label */}
                    <span className="inline-block uppercase tracking-[0.2em] text-xs sm:text-sm text-white/70 mb-3 font-medium">
                      Featured Destination
                    </span>

                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight drop-shadow-lg">
                      {title}
                    </h2>

                    {description && (
                      <p className="text-base sm:text-xl text-white/80 mb-8 drop-shadow-md line-clamp-2 max-w-2xl leading-relaxed">
                        {description}
                      </p>
                    )}

                    <Link
                      href={`/${relationTo}/${slug}`}
                      className="inline-block bg-white text-black px-8 py-3.5 uppercase font-semibold text-xs tracking-widest hover:bg-neutral-100 active:scale-95 transition-all duration-200 rounded-sm shadow-lg"
                    >
                      Explore Destination
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Prev Arrow */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all duration-200 shadow-lg"
      >
        <ChevronLeft />
      </button>

      {/* Next Arrow */}
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all duration-200 shadow-lg"
      >
        <ChevronRight />
      </button>

      {/* Slide counter */}
      <div className="absolute top-5 right-6 z-30 text-white/60 text-sm font-mono tracking-widest">
        {String(selectedIndex + 1).padStart(2, '0')} / {String(posts?.length).padStart(2, '0')}
      </div>

      {/* Navigation bullets */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
        {posts?.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              selectedIndex === idx ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
