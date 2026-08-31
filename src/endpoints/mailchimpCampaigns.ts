import type { Endpoint } from 'payload'

import { getMailchimpClient, isMailchimpMarketingConfigured } from '@/utilities/mailchimp'

const DEFAULT_COUNT = 20
const MAX_COUNT = 50

type MailchimpCampaignListItem = {
  archive_url?: string
  id: string
  long_archive_url?: string
  send_time?: string
  settings?: {
    preview_text?: string
    subject_line?: string
    title?: string
  }
  web_id?: number
}

type MailchimpCampaignsListResponse = {
  campaigns?: MailchimpCampaignListItem[]
  total_items?: number
}

// Admin-only tooling used by the Newsletters collection's campaign picker
// field to list sent campaigns from Mailchimp. Not exposed to site visitors.
export const mailchimpCampaignsEndpoint: Endpoint = {
  path: '/mailchimp-campaigns',
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

    const offset = Math.max(0, Number(req.searchParams?.get('offset')) || 0)
    const count = Math.min(
      MAX_COUNT,
      Math.max(1, Number(req.searchParams?.get('count')) || DEFAULT_COUNT),
    )

    try {
      const client = getMailchimpClient()
      const response = (await client.campaigns.list({
        count,
        offset,
        sortDir: 'DESC',
        sortField: 'send_time',
        status: 'sent',
        fields: [
          'campaigns.id',
          'campaigns.web_id',
          'campaigns.send_time',
          'campaigns.archive_url',
          'campaigns.long_archive_url',
          'campaigns.settings.subject_line',
          'campaigns.settings.title',
          'campaigns.settings.preview_text',
          'total_items',
        ],
      })) as unknown as MailchimpCampaignsListResponse

      const campaigns = (response.campaigns || []).map((campaign) => ({
        id: campaign.id,
        webId: campaign.web_id,
        title: campaign.settings?.title || campaign.settings?.subject_line || 'Untitled campaign',
        previewText: campaign.settings?.preview_text || null,
        sendTime: campaign.send_time || null,
        // long_archive_url is the stable campaign-archive.com link that embeds
        // cleanly in an iframe; archive_url (mailchi.mp) is the fallback.
        archiveUrl: campaign.long_archive_url || campaign.archive_url || null,
      }))

      const totalItems = response.total_items || 0

      return Response.json({
        campaigns,
        totalItems,
        hasMore: offset + campaigns.length < totalItems,
      })
    } catch (err) {
      req.payload.logger.error({ err }, 'Failed to list Mailchimp campaigns')
      return Response.json({ error: 'Failed to load campaigns from Mailchimp.' }, { status: 502 })
    }
  },
}
