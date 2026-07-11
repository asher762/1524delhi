import React from 'react'
import type { Page } from '@/payload-types'

type Props = Extract<Page['layout'][0], { blockType: 'relatedSocialLinks' }>

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
      {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-items-center">
        {links?.map((link, index) => {
          if (!link.url) return null

          const embedUrl =
            link.platform === 'instagram'
              ? getInstagramEmbedUrl(link.url)
              : getFacebookEmbedUrl(link.url)

          if (!embedUrl) return null

          return (
            <div key={index} className="w-full flex justify-center">
              <iframe
                src={embedUrl}
                width="400"
                height="500"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
