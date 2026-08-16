import type { Block } from 'payload'
import { iconOptions } from './iconOptions'

export const IconBlock: Block = {
  slug: 'icon',
  interfaceName: 'IconBlock',
  labels: {
    singular: 'Icon',
    plural: 'Icons',
  },
  fields: [
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: 'Star',
      options: iconOptions.map((name) => ({ label: name, value: name })),
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Extra Large', value: 'xl' },
      ],
    }
  ],
}
