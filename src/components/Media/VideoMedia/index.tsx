import { cn } from '@/utilities/ui'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

  if (resource && typeof resource === 'object') {
    const { url, updatedAt, mimeType } = resource

    return (
      <video
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        playsInline
      >
        {/* `type` lets the browser reject a codec it cannot play without
            downloading the file first. `preload` is deliberately left unset:
            with autoPlay the browser fetches regardless, so setting it would
            change nothing while risking a blank hero (there is no poster). */}
        <source src={getMediaUrl(url, updatedAt)} type={mimeType ?? undefined} />
      </video>
    )
  }

  return null
}
