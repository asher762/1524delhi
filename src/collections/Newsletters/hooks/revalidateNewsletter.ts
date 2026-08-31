import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateNewsletter: CollectionAfterChangeHook<any> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/newsletters/${doc.slug}`

      payload.logger.info(`Revalidating newsletter at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/newsletters')
      revalidateTag('newsletters-sitemap', 'max')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/newsletters/${previousDoc.slug}`

      payload.logger.info(`Revalidating old newsletter at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/newsletters')
      revalidateTag('newsletters-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<any> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/newsletters/${doc?.slug}`

    revalidatePath(path)
    revalidatePath('/newsletters')
    revalidateTag('newsletters-sitemap', 'max')
  }

  return doc
}
