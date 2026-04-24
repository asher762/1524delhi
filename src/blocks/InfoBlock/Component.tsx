import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { Media } from '../../components/Media'

import type { InfoBlock as InfoBlockProps } from '@/payload-types'

export const InfoBlockComponent: React.FC<InfoBlockProps> = (props) => {
  const { richText, media, reverse } = props

  return (
    <div className="container my-16">
      <div
        className={cn('flex flex-col gap-8 lg:gap-16 items-center', {
          'lg:flex-row-reverse': reverse,
          'lg:flex-row': !reverse,
        })}
      >
        <div className="w-full lg:w-1/2">
          {media && typeof media === 'object' && (
            <Media imgClassName="rounded-xl w-full h-auto object-cover" resource={media} />
          )}
        </div>
        <div className="w-full lg:w-1/2">
          {richText && <RichText data={richText} enableGutter={false} />}
        </div>
      </div>
    </div>
  )
}
