import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden">
      {media && typeof media === 'object' && (
        <div className="absolute inset-0">
          <Media
            fill
            imgClassName="object-cover"
            videoClassName="absolute inset-0 h-full w-full object-cover"
            priority
            resource={media}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      <div className="container relative z-10 flex h-full min-h-[70vh] flex-col items-center justify-end py-24 text-center text-white">
        {richText && <RichText className="mb-8 w-full max-w-3xl mx-auto text-center" data={richText} enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}

        {media && typeof media === 'object' && media?.caption && (
          <div className="mt-8 max-w-3xl text-sm text-white/70 md:text-base">
            <RichText data={media.caption} enableGutter={false} />
          </div>
        )}
      </div>
    </div>
  )
}
