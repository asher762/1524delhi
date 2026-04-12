import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateVillaAndEstate: CollectionAfterChangeHook<any> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/villas-and-estates/${doc.slug}`

      payload.logger.info(`Revalidating villa and estate at path: ${path}`)

      revalidatePath(path)
      revalidateTag('villas-and-estates-sitemap', 'max')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/villas-and-estates/${previousDoc.slug}`

      payload.logger.info(`Revalidating old villa and estate at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('villas-and-estates-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<any> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/villas-and-estates/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('villas-and-estates-sitemap', 'max')
  }

  return doc
}
