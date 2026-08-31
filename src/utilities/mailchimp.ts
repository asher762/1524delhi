import mailchimp from '@mailchimp/mailchimp_marketing'

let mailchimpConfigured = false

// Shared Mailchimp Marketing API client, used by both the newsletter signup
// endpoint and the newsletters campaign picker. setConfig only needs to run
// once per server instance.
export function getMailchimpClient() {
  if (!mailchimpConfigured) {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_MARKETING_API_KEY,
      server: process.env.MAILCHIMP_MARKETING_SERVER_PREFIX,
    })
    mailchimpConfigured = true
  }
  return mailchimp
}

export function isMailchimpMarketingConfigured(): boolean {
  return Boolean(process.env.MAILCHIMP_MARKETING_API_KEY && process.env.MAILCHIMP_MARKETING_SERVER_PREFIX)
}
