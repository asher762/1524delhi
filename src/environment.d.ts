declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string

      // Vercel Blob storage (src/plugins/index.ts)
      BLOB_READ_WRITE_TOKEN: string

      // Live preview + scheduled jobs
      PREVIEW_SECRET: string
      CRON_SECRET: string

      // Mailchimp Transactional (Mandrill) — Payload email adapter
      MAILCHIMP_TRANSACTIONAL_API_KEY: string
      MAILCHIMP_TRANSACTIONAL_FROM_EMAIL: string
      MAILCHIMP_TRANSACTIONAL_FROM_NAME: string

      // Internal recipient for contact-form notifications
      CONTACT_NOTIFICATION_EMAIL: string

      // Mailchimp Marketing — newsletter signup endpoint
      MAILCHIMP_MARKETING_API_KEY: string
      MAILCHIMP_MARKETING_SERVER_PREFIX: string
      MAILCHIMP_AUDIENCE_ID: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
