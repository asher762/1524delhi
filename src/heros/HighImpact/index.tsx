'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { ChevronDown } from 'lucide-react'

type Slide = {
  richText?: Page['hero']['richText']
  links?: Page['hero']['links']
  media?: Page['hero']['media']
}

type Props = Slide & { slides?: Slide[] }

export const HighImpactHero: React.FC<Props> = ({ slides, richText, links, media }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cursorDir, setCursorDir] = useState<'left' | 'right'>('right')

  const normalized: Slide[] = slides?.length ? slides : [{ richText, links, media }]
  const total = normalized.length

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const startAuto = useCallback(() => {
    if (total <= 1) return
    autoRef.current = setInterval(() => {
      setSelectedIndex((i) => (i + 1) % total)
    }, 5000)
  }, [total])

  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
  }, [])

  useEffect(() => {
    startAuto()
    return stopAuto
  }, [startAuto, stopAuto])

  const goTo = useCallback(
    (index: number) => {
      stopAuto()
      setSelectedIndex((index + total) % total)
      startAuto()
    },
    [total, startAuto, stopAuto],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (total <= 1) return
      const mid = e.currentTarget.getBoundingClientRect().width / 2
      if (e.nativeEvent.offsetX < mid) {
        setCursorDir('left')
      } else {
        setCursorDir('right')
      }
    },
    [total],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (total <= 1) return
      const mid = e.currentTarget.getBoundingClientRect().width / 2
      if (e.nativeEvent.offsetX < mid) {
        goTo(selectedIndex - 1)
      } else {
        goTo(selectedIndex + 1)
      }
    },
    [total, selectedIndex, goTo],
  )

  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  const cursorStyle = total > 1 ? (cursorDir === 'left' ? 'w-resize' : 'e-resize') : 'default'

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-black select-none"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{ cursor: cursorStyle }}
    >
      {/* Slides */}
      {normalized.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === selectedIndex ? 1 : 0 }}
          aria-hidden={i !== selectedIndex}
        >
          {/* Background image */}
          {slide.media && typeof slide.media === 'object' && (
            <div className="absolute inset-0">
              <Media fill imgClassName="object-cover" priority={i === 0} resource={slide.media} />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/35" />
            </div>
          )}

          {/* Slide content */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center text-white">
            {slide.richText && (
              <div className="max-w-3xl">
                <RichText data={slide.richText} enableGutter={false} />
              </div>
            )}
            {Array.isArray(slide.links) && slide.links.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-4 tracking-widest">
                {slide.links.map(({ link }, j) => (
                  <li key={j}>
                    <CMSLink {...link} className="" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}

      {/* Dot indicators — isolated from click handler */}
      {total > 1 && (
        <div
          className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {normalized.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-[6px] rounded-full transition-all duration-400',
                i === selectedIndex ? 'w-7 bg-white' : 'w-[6px] bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      )}

      {/* Scroll cue — isolated from click handler */}
      <div
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleScrollDown}
          className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
          aria-label="Scroll to discover more"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.3em]">
            Scroll to discover more
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </div>
  )
}

// Small inline helper so we don't need to import cn separately in this file
function cn(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ')
}
