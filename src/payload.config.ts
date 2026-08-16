import { timingSafeEqual } from 'crypto'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Hotels } from './collections/Hotels'
import { VillasAndEstates } from './collections/VillasAndEstates'
import { Experiences } from './collections/Experiences'
import { Journeys } from './collections/Journeys'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { newsletterSignupEndpoint } from './endpoints/newsletterSignup'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: getServerSideURL(),
  admin: {
    components: {
      graphics: {
        Logo: '/components/Logo/AdminLogo',
        Icon: '/components/Logo/AdminIcon',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    Hotels,
    VillasAndEstates,
    Experiences,
    Journeys,
    Pages,
    Posts,
    Media,
    Categories,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  endpoints: [newsletterSignupEndpoint],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  email: nodemailerAdapter({
    defaultFromAddress: process.env.MAILCHIMP_TRANSACTIONAL_FROM_EMAIL || 'noreply@1524delhi.com',
    defaultFromName: process.env.MAILCHIMP_TRANSACTIONAL_FROM_NAME || '1524 Delhi',
    transportOptions: {
      host: 'smtp.mandrillapp.com',
      port: 587,
      auth: {
        user: process.env.MAILCHIMP_TRANSACTIONAL_FROM_EMAIL || '1524 Delhi',
        pass: process.env.MAILCHIMP_TRANSACTIONAL_API_KEY,
      },
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        if (!authHeader) return false

        // Constant-time compare so the header cannot be recovered byte-by-byte
        // via response timing. timingSafeEqual throws on length mismatch, so
        // the lengths are checked first.
        const expected = Buffer.from(`Bearer ${secret}`)
        const actual = Buffer.from(authHeader)
        if (expected.length !== actual.length) return false
        return timingSafeEqual(expected, actual)
      },
    },
    tasks: [],
  },
})
