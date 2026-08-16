'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import RichText from '@/components/RichText'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CardsBlock as CardsBlockProps } from '@/payload-types'
import { X } from 'lucide-react'
import { cn } from '@/utilities/ui'

type Card = NonNullable<CardsBlockProps['cards']>[number]

function getFirstImage(card: Card): Media | null {
  const media = card.media
  if (!media || media.length === 0) return null
  const first = media[0]?.image
  if (!first || typeof first !== 'object') return null
  return first as Media
}

type CardCarouselProps = {
  card: Card
  onClick: () => void
}

function CardThumbnail({ card, onClick }: CardCarouselProps) {
  const coverImage = getFirstImage(card)

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden bg-card hover:cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Open card details"
    >
      {/* Image area */}
      <div className="relative w-full aspect-square overflow-hidden bg-muted">
        {!coverImage && (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {coverImage?.url && (
          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
            <Image
              src={coverImage.url}
              alt={coverImage.alt || 'Card image'}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw"
            />
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Content overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white flex flex-col justify-end text-left">
        {card.title && typeof card.title === 'string' && (
          <h3 className="text-xl font-bold leading-tight mb-0">{card.title}</h3>
        )}

        {/* Description preview */}
        {card.description && typeof card.description === 'object' && (
          <div className="line-clamp-2 text-sm text-white/80 **:text-white/80! **:mb-0! [&_h2]:text-sm [&_h3]:text-sm [&_h4]:text-sm mt-2">
            <RichText data={card.description as any} enableGutter={false} enableProse={false} />
          </div>
        )}

        {/* Read more indicator */}
        {((card.media && card.media.length > 1) || card.description) && (
          <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-white flex items-center group-hover:text-white/80 transition-colors">
            See more{' '}
            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0 duration-300">
              →
            </span>
          </span>
        )}
      </div>
    </button>
  )
}

type CardDrawerProps = {
  card: Card | null
  open: boolean
  onClose: () => void
}

function CardDrawer({ card, open, onClose }: CardDrawerProps) {
  if (!card) return null

  const images =
    card.media
      ?.map((m) => m.image)
      .filter((img): img is Media => typeof img === 'object' && img !== null && !!img.url) ?? []

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent>
        {/* Visually-hidden title for screen-reader accessibility */}
        <DialogTitle className="sr-only">Card Details</DialogTitle>

        <DialogHeader className="relative">
          <DialogClose
            className="absolute right-0 top-0 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DialogClose>

          {card.title && typeof card.title === 'string' && (
            <div className="pr-10">
              <h2 className="text-2xl font-serif">{card.title}</h2>
            </div>
          )}
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Image carousel */}
          {images.length > 0 && (
            <div className="relative">
              <Carousel opts={{ loop: images.length > 1, align: 'start' }} className="w-full">
                <CarouselContent>
                  {images.map((img, idx) => (
                    <CarouselItem key={idx} className="basis-full sm:basis-[85%]">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        <Image
                          src={img.url!}
                          alt={img.alt || `Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 80vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          {/* Description */}
          {card.description && typeof card.description === 'object' && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <RichText data={card.description as any} enableGutter={false} enableProse={true} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CardsBlock(props: CardsBlockProps) {
  const { header, cards } = props
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function openCard(card: Card) {
    setSelectedCard(card)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    // keep card data until drawer animation finishes
    setTimeout(() => setSelectedCard(null), 300)
  }

  return (
    <div className="container my-16">
      {/* Optional header */}
      {header && typeof header === 'object' && (
        <div className="text-center mb-10 [&_h1]:!text-center [&_h2]:!text-center [&_h3]:!text-center [&_h2]:text-4xl [&_h3]:text-3xl mx-10">
          <RichText data={header as any} enableGutter={false} enableProse={false} />
        </div>
      )}

      {/* Cards carousel */}
      {cards && cards.length > 0 && (
        <div className="relative px-8">
          <Carousel
            opts={{
              align: 'start',
              loop: cards.length > 3,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {cards.map((card, idx) => (
                <CarouselItem
                  key={card.id ?? idx}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <CardThumbnail card={card} onClick={() => openCard(card)} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {cards.length > 1 && (
              <>
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </>
            )}
          </Carousel>
        </div>
      )}

      {/* Drawer */}
      <CardDrawer card={selectedCard} open={drawerOpen} onClose={closeDrawer} />
    </div>
  )
}
