import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { Media } from '../../components/Media'
import { CMSLink } from '../../components/Link'

import type { FullWidthInfoBlock as FullWidthInfoBlockProps } from '@/payload-types'

export const FullWidthInfoBlockComponent: React.FC<FullWidthInfoBlockProps> = (props) => {
  const { richText, media, textAlign, enableLink, link } = props
  const align = textAlign || 'left'

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[3/2] lg:aspect-[16/7] overflow-hidden">
      {media && typeof media === 'object' && (
        <Media fill imgClassName="object-cover" resource={media} />
      )}
      <div className="absolute inset-0 z-10 container flex">
        <div
          className={cn(
            'flex flex-col justify-center gap-4 px-8 py-10 text-white lg:px-12 lg:py-14',
            'border-x border-white/25 bg-black/55 backdrop-blur-[2px]',
            'shadow-[inset_2px_0_0_rgba(255,255,255,0.25),inset_-2px_0_0_rgba(255,255,255,0.25),0_0_40px_10px_rgba(0,0,0,0.35)]',
            {
              'w-full mr-auto text-left items-start sm:w-4/5 md:w-3/5 lg:w-2/5': align === 'left',
              'w-full mx-auto text-center items-center sm:w-4/5 md:w-3/5 lg:w-1/2':
                align === 'center',
              'w-full ml-auto text-right items-end sm:w-4/5 md:w-3/5 lg:w-2/5': align === 'right',
            },
          )}
        >
          {richText && (
            <RichText
              data={richText}
              enableGutter={false}
              className={cn('prose-invert', {
                '[&_*]:!text-left': align === 'left',
                '[&_*]:!text-center': align === 'center',
                '[&_*]:!text-right': align === 'right',
              })}
            />
          )}
          {enableLink && <CMSLink {...link} />}
        </div>
      </div>
    </div>
  )
}
