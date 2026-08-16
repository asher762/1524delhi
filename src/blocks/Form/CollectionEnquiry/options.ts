export type EnquirySection = {
  label: string
  value: string
  /** Payload REST collection slug to query for this section's items */
  source: string
  type: 'collection' | 'category'
  /** Category id to filter posts by, only set for `type: 'category'` */
  categoryId?: string
}

/**
 * These four map 1:1 to the site's own detail-page collections
 * (src/collections/Hotels, Experiences, Journeys, VillasAndEstates) and their
 * routes, so they're fixed the same way US states/countries are fixed —
 * they change only when the codebase itself grows a new collection.
 * Everything else (Offers, News, ...) is a Posts category and is fetched
 * live from /api/categories in CollectionEnquiry/index.tsx.
 */
export const enquirySections: EnquirySection[] = [
  { label: 'Hotels', value: 'hotels', source: 'hotels', type: 'collection' },
  { label: 'Experiences', value: 'experiences', source: 'experiences', type: 'collection' },
  {
    label: 'Villas & Estates',
    value: 'villas-and-estates',
    source: 'villas-and-estates',
    type: 'collection',
  },
  { label: 'Journeys', value: 'journeys', source: 'journeys', type: 'collection' },
]
