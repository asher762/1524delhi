import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container my-16">
      <div className="border-border flex flex-col items-center gap-8 border-y py-16 text-center">
        {richText && <RichText className="mb-0 max-w-2xl" data={richText} enableGutter={false} />}
        {links && links.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {links.map(({ link }, i) => (
              <CMSLink
                key={i}
                size="lg"
                className="rounded-full px-8 font-sans text-xs uppercase tracking-[0.32em]"
                {...link}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
