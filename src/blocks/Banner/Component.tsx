import type { BannerBlock as BannerBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  const bannerStyle = style || 'info'

  return (
    <div className={cn('w-full max-w-5xl mx-auto my-6 px-4 md:px-6', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-l-4 p-5 md:p-6 transition-all duration-200 shadow-sm',
          {
            'border-border bg-card text-card-foreground border-l-primary': bannerStyle === 'info',
            'border-warning bg-warning/20 text-foreground border-l-warning':
              bannerStyle === 'warning',
            'border-error bg-error/20 text-foreground border-l-error': bannerStyle === 'error',
            'border-success bg-success/20 text-foreground border-l-success':
              bannerStyle === 'success',
          },
        )}
      >
        <div className="flex-1 min-w-0 text-sm md:text-base leading-relaxed font-sans [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_li]:my-1">
          <RichText data={content} enableGutter={false} enableProse={false} />
        </div>
      </div>
    </div>
  )
}
