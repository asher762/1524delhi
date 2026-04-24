import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="pt-24">
      <div className="container flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          {richText && <RichText className="mb-8 w-full max-w-3xl" data={richText} enableGutter={false} />}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <div className="flex-1 w-full">
          {media && typeof media === 'object' && (
            <div className="mx-auto max-w-5xl">
              <Media
                className="w-full rounded-2xl overflow-hidden shadow-lg"
                imgClassName="w-full h-auto object-cover"
                priority
                resource={media}
              />
              {media?.caption && (
                <div className="mt-4 text-center text-sm md:text-base text-muted-foreground">
                  <RichText data={media.caption} enableGutter={false} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
