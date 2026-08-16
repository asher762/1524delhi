import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config })
  const forms = await payload.db.pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'send_admin_notification'`,
  )
  const submissions = await payload.db.pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'status'`,
  )
  console.log('forms.send_admin_notification exists:', forms.rows.length > 0)
  console.log('form_submissions.status exists:', submissions.rows.length > 0)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
