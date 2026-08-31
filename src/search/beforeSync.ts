import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

type RelatedDoc = { id: string | number; title: string }

const populateRelated = async ({
  req,
  collection,
  items,
  fieldLabel,
  logContext,
}: {
  req: Parameters<BeforeSync>[0]['req']
  collection: 'categories' | 'countries'
  items: unknown
  fieldLabel: string
  logContext: { collection: string | number; id: unknown }
}): Promise<RelatedDoc[]> => {
  const populated: RelatedDoc[] = []

  if (!items || !Array.isArray(items) || items.length === 0) {
    return populated
  }

  for (const item of items) {
    if (!item) {
      continue
    }

    if (typeof item === 'object') {
      populated.push(item as RelatedDoc)
      continue
    }

    const doc = await req.payload.findByID({
      collection,
      id: item,
      disableErrors: true,
      depth: 0,
      select: { title: true },
      req,
    })

    if (doc !== null) {
      populated.push(doc as RelatedDoc)
    } else {
      console.error(
        `Failed. ${fieldLabel} not found when syncing collection '${logContext.collection}' with id: '${logContext.id}' to search.`,
      )
    }
  }

  return populated
}

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, country, title, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
    country: [],
  }

  const logContext = { collection, id }

  const populatedCategories = await populateRelated({
    req,
    collection: 'categories',
    items: categories,
    fieldLabel: 'Category',
    logContext,
  })

  modifiedDoc.categories = populatedCategories.map((each) => ({
    relationTo: 'categories',
    categoryID: String(each.id),
    title: each.title,
  }))

  const populatedCountries = await populateRelated({
    req,
    collection: 'countries',
    items: country,
    fieldLabel: 'Country',
    logContext,
  })

  modifiedDoc.country = populatedCountries.map((each) => ({
    relationTo: 'countries',
    countryID: String(each.id),
    title: each.title,
  }))

  return modifiedDoc
}
