import type { Block } from 'payload'

export const RelatedSocialLinks: Block = {
  slug: 'relatedSocialLinks',
  interfaceName: 'RelatedSocialLinksBlock',
  labels: {
    singular: 'Related Social Links Block',
    plural: 'Related Social Links Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Block Title (Optional)',
      required: false,
    },
    {
      name: 'links',
      type: 'array',
      label: 'Social Links',
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          label: 'Post URL',
          required: true,
          admin: {
            description: 'Paste the full URL to the Instagram or Facebook post.',
          },
        },
        {
          name: 'platform',
          type: 'select',
          label: 'Platform',
          required: true,
          defaultValue: 'instagram',
          options: [
            {
              label: 'Instagram',
              value: 'instagram',
            },
            {
              label: 'Facebook',
              value: 'facebook',
            },
          ],
        },
      ],
    },
  ],
}
