import React from 'react'
import RichText from '@/components/RichText'

import type { RichTextBlock as RichTextBlockProps } from '@/payload-types'

export const RichTextBlockComponent: React.FC<RichTextBlockProps> = (props) => {
  const { richText } = props

  return (
    <div className="container">
      {richText && <RichText data={richText} enableGutter={false} />}
    </div>
  )
}
