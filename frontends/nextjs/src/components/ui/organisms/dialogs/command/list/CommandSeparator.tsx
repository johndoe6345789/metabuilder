'use client'

import { forwardRef } from 'react'
import { Divider } from '@mui/material'

const CommandSeparator = forwardRef<HTMLHRElement, Record<string, never>>((props, ref) => {
  return <Divider ref={ref} sx={{ my: 1 }} {...props} />
})

CommandSeparator.displayName = 'CommandSeparator'

export { CommandSeparator }
