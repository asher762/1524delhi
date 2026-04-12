import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateJourney: CollectionAfterChangeHook<any> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/journeys/${doc.slug}`

      payload.logger.info(`Revalidating journey at path: ${path}`)

      revalidatePath(path)
      revalidateTag('journeys-sitemap', 'max')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/journeys/${previousDoc.slug}`

      payload.logger.info(`Revalidating old journey at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('journeys-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<any> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/journeys/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('journeys-sitemap', 'max')
  }

  return doc
}
