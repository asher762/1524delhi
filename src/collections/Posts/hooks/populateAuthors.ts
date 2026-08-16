import type { CollectionAfterReadHook } from 'payload'
import { User } from '@/payload-types'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req, req: { payload } }) => {
  if (doc?.authors && doc?.authors?.length > 0) {
    const authorIDs = doc.authors
      .map((author: User | number | string) => (typeof author === 'object' ? author?.id : author))
      .filter(Boolean)

    if (authorIDs.length === 0) return doc

    try {
      // One query instead of a serial findByID per author. This hook runs on
      // every post read, including list views, so the previous loop cost one
      // round-trip per author per document.
      const authors = await payload.find({
        collection: 'users',
        depth: 0,
        limit: authorIDs.length,
        pagination: false,
        // Passing `req` keeps this inside the caller's transaction rather than
        // opening a fresh one for each lookup.
        req,
        where: { id: { in: authorIDs } },
      })

      if (authors.docs.length > 0) {
        // Preserve the author order configured on the document; `find` returns
        // rows in database order, which need not match.
        const byID = new Map(authors.docs.map((author) => [String(author.id), author]))

        doc.populatedAuthors = authorIDs
          .map((id: number | string) => byID.get(String(id)))
          .filter(Boolean)
          .map((author: User) => ({
            id: author.id,
            name: author.name,
          }))
      }
    } catch {
      // swallow error
    }
  }

  return doc
}
