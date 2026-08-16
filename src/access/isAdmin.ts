import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => Boolean(user?.roles?.includes('admin'))

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  Boolean(user?.roles?.includes('admin'))
