import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isAdmin } from '../../access/isAdmin'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateNewsletter } from './hooks/revalidateNewsletter'

import { slugField } from 'payload'

export const Newsletters: CollectionConfig<'newsletters'> = {
  slug: 'newsletters',
  labels: {
    singular: 'Newsletter',
    plural: 'Newsletters',
  },
  access: {
    create: authenticated,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    thumbnailUrl: true,
    previewText: true,
  },
  admin: {
    group: 'Content',
    defaultColumns: ['title', 'sentAt', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'newsletters',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'newsletters',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      // Auto-filled from the campaign subject line by the picker below.
      // Not shown in the form — the campaign IS the newsletter, there's
      // nothing else to type.
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'mailchimpCampaignId',
      type: 'text',
      label: 'Newsletter',
      required: true,
      admin: {
        description: 'Pick a sent campaign from Mailchimp to publish as a newsletter.',
        components: {
          Field: '@/collections/Newsletters/CampaignPicker#CampaignPicker',
        },
      },
    },
    {
      name: 'mailchimpArchiveUrl',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'contentHtml',
      type: 'textarea',
      // Mailchimp campaign HTML (inline styles, tables, Outlook VML, etc.)
      // routinely exceeds Payload's 40,000-character default text limit.
      maxLength: 2_000_000,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'previewText',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      label: 'Sent Date',
      admin: {
        hidden: true,
      },
    },
    slugField({
      overrides: (field) => {
        // Auto-generated from `title`; editors never need to see or touch it.
        const slugTextField = field.fields[1] as { admin?: Record<string, unknown> }
        slugTextField.admin = { ...slugTextField.admin, hidden: true }
        return field
      },
    }),
  ],
  hooks: {
    afterChange: [revalidateNewsletter],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
