import type { Block } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { link } from '@/fields/link'
import { IconBlock } from '@/blocks/Icon/config'

export const CarouselBlock: Block = {
  slug: 'carouselBlock',
  interfaceName: 'CarouselBlock',
  labels: {
    singular: 'Carousel',
    plural: 'Carousels',
  },
  fields: [
    {
      name: 'carouselType',
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Cards (3 per view)', value: 'cards' },
        { label: 'Full Width', value: 'fullWidth' },
      ],
      defaultValue: 'cards',
      required: true,
      admin: {
        layout: 'horizontal',
        description: 'Cards Slides Layout.',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      admin: {
        description: 'Optional heading shown above the carousel.',
      },
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Slides',
      minRows: 1,
      admin: {
        description: 'Add one entry per slide. Aim for 3+ slides for the best experience.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
          admin: {
            description: 'Add a background image for the slide.',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Slide Title',
          admin: {
            description: 'Keep under 60 characters.',
          },
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Content',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              BlocksFeature({ inlineBlocks: [IconBlock] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
          admin: {
            description:
              'Cards layout: keep under ~120 characters. Full Width: keep under ~250 characters for best readability.',
          },
        },
        {
          name: 'enableLink',
          type: 'checkbox',
          label: 'Add a Link',
          defaultValue: false,
        },
        link({
          overrides: {
            admin: {
              condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
            },
          },
        }),
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Autoplay',
      defaultValue: false,
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      label: 'Autoplay interval (seconds)',
      defaultValue: 5,
      min: 2,
      max: 15,
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.autoplay),
      },
    },
  ],
}
