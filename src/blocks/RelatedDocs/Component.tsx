import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'

import { Card } from '../../components/Card'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export type RelatedDocsProps = {
  className?: string
  docs?: any[]
  relationTo: string
  introContent?: DefaultTypedEditorState
}

export const RelatedDocs: React.FC<RelatedDocsProps> = (props) => {
  const { className, docs, relationTo, introContent } = props

  return (
    <div className={clsx('lg:container', className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch">
        {docs?.map((doc, index) => {
          if (typeof doc === 'string') return null

          return <Card key={index} doc={doc} relationTo={relationTo} showCategories />
        })}
      </div>
    </div>
  )
}
