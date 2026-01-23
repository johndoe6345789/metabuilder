import React from 'react'

export interface IframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string
  title: string
  width?: string | number
  height?: string | number
  allowFullScreen?: boolean
  sandbox?: string
}

/**
 * Iframe component for embedded content
 * Used by scripted packages for embedding external content
 */
export const Iframe: React.FC<IframeProps> = ({
  src,
  title,
  width = '100%',
  height = 400,
  allowFullScreen = true,
  sandbox,
  className = '',
  ...props
}) => (
  <iframe
    src={src}
    title={title}
    width={width}
    height={height}
    allowFullScreen={allowFullScreen}
    sandbox={sandbox}
    className={`iframe ${className}`}
    {...props}
  />
)

export default Iframe
