import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Block, Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { IconBlock } from '@/blocks/Icon/config'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { sendContactNotificationEmail } from '@/hooks/sendContactNotificationEmail'
import { isAdmin } from '@/access/isAdmin'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<any> = ({ doc }) => {
  return doc?.title ? `${doc.title} | 1524 Delhi` : '1524 Delhi'
}

const generateURL: GenerateURL<any> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

// Replaces the form-builder plugin's built-in State/Country fields, which this site
// never used. Fetches its own section + item options live client-side (see
// src/blocks/Form/CollectionEnquiry) instead of storing them in the admin schema.
const collectionEnquiryBlock: Block = {
  slug: 'collectionEnquiry',
  labels: {
    singular: 'Collection Enquiry',
    plural: 'Collection Enquiry Fields',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name (lowercase, no special characters)',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          localized: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'width',
          type: 'number',
          label: 'Field Width (percentage)',
          admin: { width: '50%' },
        },
        {
          name: 'required',
          type: 'checkbox',
          label: 'Required',
          admin: { width: '50%' },
        },
      ],
    },
  ],
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'hotels', 'villas-and-estates', 'experiences', 'journeys'],
    overrides: {
      admin: {
        group: 'Collections',
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      state: false,
      country: false,
      payment: false,
      // The plugin's FieldsConfig type only documents Partial<Field> here, but the
      // runtime (generateFormCollection) accepts a full Block to register a new field type.
      collectionEnquiry: collectionEnquiryBlock,
    },
    formOverrides: {
      admin: {
        group: 'Collections',
      },
      fields: ({ defaultFields }) => {
        return [
          ...defaultFields.map((field) => {
            if ('name' in field && field.name === 'confirmationMessage') {
              return {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => {
                    return [
                      ...rootFeatures,
                      FixedToolbarFeature(),
                      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                      BlocksFeature({ inlineBlocks: [IconBlock] }),
                    ]
                  },
                }),
              }
            }
            return field
          }),
          {
            name: 'sendAdminNotification',
            type: 'checkbox',
            label: 'Send internal notification email',
            defaultValue: false,
            admin: {
              position: 'sidebar',
              description:
                'When enabled, each new submission of this form sends an internal alert to CONTACT_NOTIFICATION_EMAIL. The visitor never receives an email from this.',
            },
          },
        ]
      },
    },
    formSubmissionOverrides: {
      access: {
        // Public forms must stay open to create — this matches the plugin default.
        create: () => true,
        // Submissions carry visitor PII (name, email, phone, enquiry details).
        // Restricted to admins, not every logged-in editor.
        read: isAdmin,
        // The plugin defaults update to `() => false`, which silently made the
        // `status` field below unsaveable for everyone.
        update: isAdmin,
        delete: isAdmin,
      },
      admin: {
        group: 'Collections',
        defaultColumns: ['form', 'status', 'createdAt'],
      },
      fields: ({ defaultFields }) => {
        return [
          ...defaultFields,
          {
            name: 'status',
            type: 'select',
            label: 'Status',
            defaultValue: 'new',
            options: [
              { label: 'New', value: 'new' },
              { label: 'Read', value: 'read' },
              { label: 'Archived', value: 'archived' },
            ],
            admin: {
              position: 'sidebar',
            },
          },
        ]
      },
      hooks: {
        afterChange: [sendContactNotificationEmail],
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'hotels', 'villas-and-estates', 'experiences', 'journeys'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        group: 'Collections',
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  vercelBlobStorage({
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  }),
]
