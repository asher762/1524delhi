import React from 'react'
import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'

type Props = Extract<Page['layout'][0], { blockType: 'socialLinks' }>

/** Extracts the shortcode from Instagram post/reel/tv URLs */
function getInstagramEmbedUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
  if (!match) return null
  return `https://www.instagram.com/p/${match[1]}/embed/`
}

/** Constructs Facebook's official plugin embed URL */
function getFacebookEmbedUrl(url: string): string {
  return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`
}

export const RelatedSocialLinksComponent: React.FC<
  Props & {
    id?: string
  }
> = (props) => {
  const { id, title, links } = props

  return (
    <div className="container my-16" id={`block-${id}`}>
      {title && <RichText className="mb-8 text-center" data={title} enableGutter={false} />}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {links?.map((link, index) => {
            if (!link.url) return null

            const embedUrl =
              link.platform === 'instagram'
                ? getInstagramEmbedUrl(link.url)
                : getFacebookEmbedUrl(link.url)

            if (!embedUrl) return null

            return (
              <CarouselItem
                key={index}
                className="flex justify-center basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div className="relative w-full max-w-[400px] mx-auto aspect-[400/600]">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder={0}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <div className="mt-6 flex items-center justify-center gap-4">
          <CarouselPrevious
            variant="ghost"
            className="static top-auto left-auto right-auto translate-x-0 translate-y-0 rotate-0 rounded-full"
          />
          <CarouselNext
            variant="ghost"
            className="static top-auto left-auto right-auto translate-x-0 translate-y-0 rotate-0 rounded-full"
          />
        </div>
      </Carousel>
    </div>
  )
}
