'use client'

import { Box } from '@mui/material'
import { forwardRef } from 'react'

const SelectSeparator = forwardRef<HTMLHRElement>((props, ref) => {
  return <Box ref={ref} component="hr" sx={{ my: 0.5, borderColor: 'divider' }} {...props} />
})

SelectSeparator.displayName = 'SelectSeparator'

export { SelectSeparator }
