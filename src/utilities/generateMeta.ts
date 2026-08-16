import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()
  let url = ''

  if (image && typeof image === 'object' && 'url' in image) {
    const source = image.sizes?.og?.url || image.url

    if (source) {
      // Storage adapters return absolute URLs (Vercel Blob serves from
      // https://<store>.public.blob.vercel-storage.com/...). Prefixing those
      // with the server URL produced a malformed `https://site/https://blob/...`
      // and broke every Open Graph preview. Only relative paths need the prefix.
      url = /^https?:\/\//i.test(source) ? source : serverUrl + source
    }
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | 1524 Delhi' : '1524 Delhi '

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
