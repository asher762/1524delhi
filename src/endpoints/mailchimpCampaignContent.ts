import type { Endpoint } from 'payload'

import { getMailchimpClient, isMailchimpMarketingConfigured } from '@/utilities/mailchimp'
import { extractNewsletterThumbnail } from '@/utilities/extractNewsletterThumbnail'
import { stripMailchimpBoilerplate } from '@/utilities/stripMailchimpFooter'

// Admin-only tooling: fetches the full HTML of one sent Mailchimp campaign so
// the Newsletters collection can store it verbatim (rendered later with no
// Mailchimp toolbar/chrome) and pull a thumbnail image out of it. Only called
// for the single campaign an editor just selected, not for the whole list.
export const mailchimpCampaignContentEndpoint: Endpoint = {
  path: '/mailchimp-campaign-content',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isMailchimpMarketingConfigured()) {
      return Response.json(
        { error: 'Mailchimp Marketing API is not configured on this server.' },
        { status: 500 },
      )
    }

    const campaignId = req.searchParams?.get('id')
    if (!campaignId) {
      return Response.json({ error: 'Missing campaign id.' }, { status: 400 })
    }

    try {
      const client = getMailchimpClient()
      const response = (await client.campaigns.getContent(campaignId, {
        fields: ['html'],
      })) as unknown as { html?: string }

      const html = stripMailchimpBoilerplate(response.html || '')

      return Response.json({
        html,
        thumbnailUrl: extractNewsletterThumbnail(html),
      })
    } catch (err) {
      req.payload.logger.error({ err }, 'Failed to fetch Mailchimp campaign content')
      return Response.json({ error: 'Failed to load this campaign from Mailchimp.' }, { status: 502 })
    }
  },
}
