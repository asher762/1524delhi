import type { GlobalConfig } from 'payload'

import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'enquireUrl',
      type: 'text',
      label: 'Enquire For Bookings URL',
      admin: {
        description: 'e.g. mailto:hello@1524delhi.com or /contact',
      },
    },
    {
      name: 'newsletterUrl',
      type: 'text',
      label: 'Newsletter Signup URL',
    },
    {
      name: 'privacyPolicyUrl',
      type: 'text',
      label: 'Privacy Policy URL',
      defaultValue: '/privacy',
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Text',
      defaultValue: 'Copyright © 1524 Delhi 2020',
    },
    {
      name: 'facebookUrl',
      type: 'text',
      label: 'Facebook URL',
    },
    {
      name: 'instagramUrl',
      type: 'text',
      label: 'Instagram URL',
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
