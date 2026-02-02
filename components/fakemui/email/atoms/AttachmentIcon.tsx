import React, { forwardRef } from 'react'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface AttachmentIconProps extends React.SVGAttributes<SVGSVGElement> {
  filename?: string
  mimeType?: string
  testId?: string
}

export const AttachmentIcon = forwardRef<SVGSVGElement, AttachmentIconProps>(
  ({ filename, mimeType, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'attachment-icon',
      identifier: customTestId || filename || 'attachment'
    })

    // Determine icon based on mime type
    const getIconContent = () => {
      if (mimeType?.startsWith('image/')) return '🖼️'
      if (mimeType?.startsWith('video/')) return '🎬'
      if (mimeType?.startsWith('audio/')) return '🎵'
      if (mimeType === 'application/pdf') return '📄'
      return '📎'
    }

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width="20"
        height="20"
        className="attachment-icon"
        role="img"
        aria-label={`Attachment: ${filename || 'document'}`}
        {...accessible}
        {...props}
      >
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
          {getIconContent()}
        </text>
      </svg>
    )
  }
)

AttachmentIcon.displayName = 'AttachmentIcon'
