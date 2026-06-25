import { useState } from 'react'
import { DEMO_CODE } from '@/components/demo/demo-constants'

export function useDemoCode() {
  const [code, setCode] = useState(DEMO_CODE)
  return { code, setCode }
}
