import { getPayload } from 'payload'
import config from './src/payload.config'

async function run() {
  const payload = await getPayload({ config })
  
  const { docs: users } = await payload.find({
    collection: 'users',
  })
  
  for (const user of users) {
    const currentRoles = user.roles || []
    if (!currentRoles.includes('admin')) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          roles: [...currentRoles, 'admin']
        }
      })
      console.log(`Updated user ${user.id} to have the 'admin' role.`)
    }
  }
  
  console.log('Done.')
  process.exit(0)
}

run().catch(console.error)
