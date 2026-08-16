import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminFieldLevel } from '../../access/isAdmin'
import { getServerSideURL } from '../../utilities/getURL'

// Payload defaults auth cookies to `secure: false`, and only forces Secure when
// sameSite is 'None' — so on an HTTPS deployment the session token was being
// set without the Secure flag. Deriving this from the configured server URL
// (rather than NODE_ENV) keeps local `next start` over http working, since that
// also runs with NODE_ENV=production.
const isHTTPS = getServerSideURL().startsWith('https://')

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Any logged-in user still sees the admin panel — needed for editors to do
    // their content-editing job. Granular permissions below are what changed.
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    // Admins see/edit every user; a non-admin can only see/edit their own record.
    read: ({ req: { user } }) =>
      Boolean(user?.roles?.includes('admin')) ? true : { id: { equals: user?.id } },
    update: ({ req: { user } }) =>
      Boolean(user?.roles?.includes('admin')) ? true : { id: { equals: user?.id } },
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
    group: 'Collections',
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: isHTTPS,
    },
    // Stated explicitly so they are visible and version-controlled. All three
    // match Payload's existing defaults, so behaviour is unchanged.
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 2 * 60 * 60,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      // New accounts default to 'editor' — the least-privileged tier. Existing
      // accounts need a one-time backfill to 'admin' so nobody currently able
      // to log in loses access; see the note in the PR/deploy checklist.
      defaultValue: ['editor'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        position: 'sidebar',
      },
      // Field-level access is the actual self-escalation guard: even if update
      // access ever broadens, a non-admin's write to this field is dropped.
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
  ],
  timestamps: true,
}
