import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateExperience: CollectionAfterChangeHook<any> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/experiences/${doc.slug}`

      payload.logger.info(`Revalidating experience at path: ${path}`)

      revalidatePath(path)
      revalidateTag('experiences-sitemap', 'max')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/experiences/${previousDoc.slug}`

      payload.logger.info(`Revalidating old experience at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('experiences-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<any> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/experiences/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('experiences-sitemap', 'max')
  }

  return doc
}
