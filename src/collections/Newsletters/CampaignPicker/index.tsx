'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Drawer,
  DrawerToggler,
  FieldLabel,
  toast,
  useDrawerSlug,
  useField,
  useFormFields,
  useModal,
} from '@payloadcms/ui'

import { getClientSideURL } from '@/utilities/getURL'

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

type MailchimpCampaign = {
  archiveUrl: string | null
  id: string
  previewText: string | null
  sendTime: string | null
  title: string
}

type CampaignsResponse = {
  campaigns: MailchimpCampaign[]
  error?: string
  hasMore: boolean
}

type CampaignContentResponse = {
  error?: string
  html: string
  thumbnailUrl: string | null
}

const PAGE_SIZE = 20

export const CampaignPicker: React.FC = () => {
  const { setValue, value } = useField<string>()
  const dispatchFields = useFormFields(([, dispatch]) => dispatch)

  const drawerSlug = useDrawerSlug('select-mailchimp-campaign')
  const { closeModal } = useModal()

  const [campaigns, setCampaigns] = useState<MailchimpCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<MailchimpCampaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const fetchCampaigns = useCallback(async (nextOffset: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${getClientSideURL()}/api/mailchimp-campaigns?offset=${nextOffset}&count=${PAGE_SIZE}`,
      )
      const data = (await res.json().catch(() => ({}))) as CampaignsResponse

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load campaigns from Mailchimp.')
      }

      setCampaigns((prev) => (nextOffset === 0 ? data.campaigns : [...prev, ...data.campaigns]))
      setHasMore(data.hasMore)
      setOffset(nextOffset)
      setLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns from Mailchimp.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpen = () => {
    if (!loaded) fetchCampaigns(0)
  }

  // If this field already has a saved campaign id (editing an existing
  // newsletter), swap the fallback "Campaign <id>" label for the real title
  // once the campaign list has been fetched.
  useEffect(() => {
    if (!selectedCampaign && value) {
      const match = campaigns.find((campaign) => campaign.id === value)
      if (match) setSelectedCampaign(match)
    }
  }, [campaigns, value, selectedCampaign])

  const handleSelect = async (campaign: MailchimpCampaign) => {
    setValue(campaign.id)
    setSelectedCampaign(campaign)
    dispatchFields({ type: 'UPDATE', path: 'title', value: campaign.title })
    dispatchFields({ type: 'UPDATE', path: 'mailchimpArchiveUrl', value: campaign.archiveUrl || '' })
    dispatchFields({ type: 'UPDATE', path: 'previewText', value: campaign.previewText || '' })
    if (campaign.sendTime) {
      dispatchFields({ type: 'UPDATE', path: 'sentAt', value: campaign.sendTime })
    }

    closeModal(drawerSlug)
    setImporting(true)

    try {
      const res = await fetch(
        `${getClientSideURL()}/api/mailchimp-campaign-content?id=${encodeURIComponent(campaign.id)}`,
      )
      const data = (await res.json().catch(() => ({}))) as CampaignContentResponse

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to import this campaign.')
      }

      dispatchFields({ type: 'UPDATE', path: 'contentHtml', value: data.html })
      dispatchFields({ type: 'UPDATE', path: 'thumbnailUrl', value: data.thumbnailUrl || '' })
      toast.success(`Imported "${campaign.title}"`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import this campaign.')
    } finally {
      setImporting(false)
    }
  }

  const currentLabel = selectedCampaign?.title || (value ? `Campaign ${value}` : null)

  return (
    <div className="field-type">
      <FieldLabel label="Newsletter" />

      {value ? (
        <div
          style={{
            alignItems: 'center',
            background: 'var(--theme-elevation-50)',
            borderRadius: 'var(--style-radius-s)',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>
              {importing ? `Importing "${currentLabel}"…` : currentLabel}
            </div>
            {selectedCampaign?.sendTime && (
              <div
                style={{
                  color: 'var(--theme-elevation-500)',
                  fontSize: '0.8rem',
                  marginTop: '0.15rem',
                }}
              >
                Sent {formatDate(selectedCampaign.sendTime)}
              </div>
            )}
          </div>
          <DrawerToggler slug={drawerSlug} onClick={handleOpen}>
            <Button buttonStyle="secondary" el="span" size="small">
              Change
            </Button>
          </DrawerToggler>
        </div>
      ) : (
        <div
          style={{
            alignItems: 'center',
            background: 'var(--theme-elevation-50)',
            border: '1px dashed var(--theme-elevation-150)',
            borderRadius: 'var(--style-radius-s)',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ color: 'var(--theme-elevation-500)' }}>No newsletter selected</span>
          <DrawerToggler slug={drawerSlug} onClick={handleOpen}>
            <Button buttonStyle="secondary" el="span" size="small">
              Select newsletter
            </Button>
          </DrawerToggler>
        </div>
      )}

      <Drawer slug={drawerSlug} title="Select a Mailchimp Campaign">
        {error && <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>}
        {loading && campaigns.length === 0 && <p>Loading sent campaigns…</p>}
        {!loading && !error && loaded && campaigns.length === 0 && (
          <p>No sent campaigns found in this Mailchimp account.</p>
        )}

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {campaigns.map((campaign) => {
            const isSelected = campaign.id === value
            return (
              <li
                key={campaign.id}
                style={{
                  alignItems: 'center',
                  borderBottom: '1px solid var(--theme-elevation-100)',
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{campaign.title}</div>
                  <div style={{ color: 'var(--theme-elevation-500)', fontSize: '0.8rem' }}>
                    {campaign.sendTime ? formatDate(campaign.sendTime) : 'Unknown send date'}
                  </div>
                </div>
                <Button
                  buttonStyle={isSelected ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleSelect(campaign)}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              </li>
            )
          })}
        </ul>

        {hasMore && (
          <div style={{ marginTop: '1rem' }}>
            <Button
              buttonStyle="secondary"
              disabled={loading}
              size="small"
              onClick={() => fetchCampaigns(offset + PAGE_SIZE)}
            >
              {loading ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
