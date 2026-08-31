import { createHash } from 'crypto'

import type { Endpoint } from 'payload'

import { getMailchimpClient } from '@/utilities/mailchimp'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Basic in-memory abuse protection. Per-instance only (resets on redeploy / doesn't
// share state across serverless invocations), but stops naive scripted spam.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5
const requestTimestamps = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (requestTimestamps.get(key) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )
  recent.push(now)
  requestTimestamps.set(key, recent)
  return recent.length > RATE_LIMIT_MAX_REQUESTS
}

// Cached lookup of which merge fields actually exist on the audience, so we only
// send tags (e.g. FNAME) that are configured in Mailchimp instead of assuming.
const MERGE_FIELD_CACHE_TTL_MS = 10 * 60_000
let mergeFieldCache: { tags: Set<string>; fetchedAt: number } | null = null

async function getAudienceMergeFieldTags(audienceId: string): Promise<Set<string>> {
  if (mergeFieldCache && Date.now() - mergeFieldCache.fetchedAt < MERGE_FIELD_CACHE_TTL_MS) {
    return mergeFieldCache.tags
  }

  const client = getMailchimpClient()
  const response = (await client.lists.getListMergeFields(audienceId, { count: 100 })) as {
    merge_fields?: { tag: string }[]
  }

  const tags = new Set((response.merge_fields || []).map((field) => field.tag))
  mergeFieldCache = { tags, fetchedAt: Date.now() }
  return tags
}

export const newsletterSignupEndpoint: Endpoint = {
  path: '/newsletter-signup',
  method: 'post',
  handler: async (req) => {
    const rateLimitKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(rateLimitKey)) {
      return Response.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 },
      )
    }

    const body = ((await req.json?.()) ?? {}) as {
      email?: string
      firstName?: string
      // Honeypot: real visitors never see or fill this field. Bots that
      // autofill every input on a form trip it.
      companyWebsite?: string
    }

    if (body.companyWebsite) {
      return Response.json({ success: true })
    }

    const email = body.email?.trim()
    const firstName = body.firstName?.trim()

    if (!email || !EMAIL_REGEX.test(email)) {
      return Response.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const apiKey = process.env.MAILCHIMP_MARKETING_API_KEY
    const server = process.env.MAILCHIMP_MARKETING_SERVER_PREFIX
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID

    if (!apiKey || !server || !audienceId) {
      req.payload.logger.error(
        'Newsletter signup failed: Mailchimp Marketing env vars are not configured',
      )
      return Response.json(
        { error: 'Newsletter signup is not available right now. Please try again later.' },
        { status: 500 },
      )
    }

    try {
      const client = getMailchimpClient()
      const subscriberHash = createHash('md5').update(email.toLowerCase()).digest('hex')

      const mergeFields: Record<string, string> = {}
      if (firstName) {
        const tags = await getAudienceMergeFieldTags(audienceId)
        if (tags.has('FNAME')) {
          mergeFields.FNAME = firstName
        }
      }

      await client.lists.setListMember(audienceId, subscriberHash, {
        email_address: email,
        // Single opt-in: new members are subscribed immediately, no confirmation
        // email. Existing members keep whatever status they already have, so we
        // never silently resubscribe someone who previously opted out.
        status_if_new: 'subscribed',
        ...(Object.keys(mergeFields).length > 0 ? { merge_fields: mergeFields } : {}),
      })

      return Response.json({ success: true })
    } catch (err) {
      req.payload.logger.error({ err }, 'Newsletter signup failed')
      return Response.json(
        { error: 'Something went wrong while signing you up. Please try again.' },
        { status: 500 },
      )
    }
  },
}
