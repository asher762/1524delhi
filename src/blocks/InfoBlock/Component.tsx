import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { Media } from '../../components/Media'
import { CMSLink } from '../../components/Link'

import type { InfoBlock as InfoBlockProps } from '@/payload-types'

export const InfoBlockComponent: React.FC<InfoBlockProps> = (props) => {
  const { richText, media, reverse, enableLink, link } = props

  return (
    <div className="container my-16">
      <div
        className={cn('flex flex-col gap-8 items-center lg:gap-12', {
          'lg:flex-row-reverse': reverse,
          'lg:flex-row': !reverse,
        })}
      >
        <div className="w-full lg:w-3/5 shrink-0">
          {media && typeof media === 'object' && (
            <Media imgClassName="rounded-xl w-full h-auto object-cover" resource={media} />
          )}
        </div>
        <div className="w-full lg:w-2/5 flex flex-col justify-center gap-4 lg:px-4">
          {richText && <RichText data={richText} enableGutter={false} />}
          {enableLink && <CMSLink {...link} />}
        </div>
      </div>
    </div>
  )
}
