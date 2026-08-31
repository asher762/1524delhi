import type { Block } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { IconBlock } from '../Icon/config'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            BlocksFeature({ inlineBlocks: [IconBlock] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'Grid',
      options: [
        { label: 'Grid', value: 'Grid' },
        { label: 'Full Screen Carousel', value: 'FullScreenCarousel' },
        { label: 'Cards Carousel', value: 'CardsCarousel' },
        { label: 'List', value: 'List' },
      ],
      label: 'Layout',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: 'Collections To Show',
      options: [
        { label: 'Posts', value: 'posts' },
        { label: 'Pages', value: 'pages' },
        { label: 'Hotels', value: 'hotels' },
        { label: 'Villas & Estates', value: 'villas-and-estates' },
        { label: 'Experiences', value: 'experiences' },
        { label: 'Journeys', value: 'journeys' },
        { label: 'Newsletters', value: 'newsletters' },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'country',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Countries To Show',
      relationTo: 'countries',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 12,
      label: 'Limit',
    },
    {
      name: 'enablePagination',
      type: 'checkbox',
      admin: {
        condition: (_, siblingData) =>
          siblingData.populateBy === 'collection' &&
          (siblingData.layout === 'Grid' || siblingData.layout === 'List'),
      },
      defaultValue: true,
      label: 'Enable Pagination',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: [
        'posts',
        'pages',
        'hotels',
        'villas-and-estates',
        'experiences',
        'journeys',
        'newsletters',
      ],
    },
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}
