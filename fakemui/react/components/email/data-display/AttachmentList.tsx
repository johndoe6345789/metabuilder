// fakemui/react/components/email/data-display/AttachmentList.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Typography, Button } from '../..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
import { AttachmentIcon } from '../atoms'

export interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  downloadUrl?: string
}

export interface AttachmentListProps extends BoxProps {
  attachments: Attachment[]
  onDownload?: (attachment: Attachment) => void
  onDelete?: (attachmentId: string) => void
  testId?: string
}

export const AttachmentList = forwardRef<HTMLDivElement, AttachmentListProps>(
  ({ attachments, onDownload, onDelete, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'attachment-list',
      identifier: customTestId || 'attachments'
    })

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
      <Box
        ref={ref}
        className="attachment-list"
        {...accessible}
        {...props}
      >
        {attachments.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No attachments
          </Typography>
        ) : (
          <ul className="attachment-items">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="attachment-item">
                <AttachmentIcon filename={attachment.filename} mimeType={attachment.mimeType} />
                <div className="attachment-info">
                  <Typography variant="body2">{attachment.filename}</Typography>
                  <Typography variant="caption">{formatFileSize(attachment.size)}</Typography>
                </div>
                <div className="attachment-actions">
                  {attachment.downloadUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownload?.(attachment)}
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete?.(attachment.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Box>
    )
  }
)

AttachmentList.displayName = 'AttachmentList'
