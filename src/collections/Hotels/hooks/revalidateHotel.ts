import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateHotel: CollectionAfterChangeHook<any> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/hotels/${doc.slug}`

      payload.logger.info(`Revalidating hotel at path: ${path}`)

      revalidatePath(path)
      revalidateTag('hotels-sitemap', 'max')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/hotels/${previousDoc.slug}`

      payload.logger.info(`Revalidating old hotel at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('hotels-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<any> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/hotels/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('hotels-sitemap', 'max')
  }

  return doc
}
