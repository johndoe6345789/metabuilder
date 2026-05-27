'use client'

import { useState } from 'react'
import { useAppDispatch } from '@/store'
import type { AppDispatch } from '@/store'
import {
  checkDBALConnection,
  fetchDBALAdapters,
  switchDBALDatabase,
  testDBALConnectionThunk,
} from '@/store/slices/dbalSlice'

/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_PORTS: Record<string, string> = {
  postgres: '5432',
  mysql: '3306',
  mongodb: '27017',
}

export const ADAPTER_FIELDS: Record<
  string,
  string[]
> = {
  sqlite: ['path'],
  postgres: ['host', 'port', 'database', 'user', 'password'],
  mysql: ['host', 'port', 'database', 'user', 'password'],
  mongodb: ['connectionString', 'database'],
}

export function buildUrl(
  adapter: string,
  fields: Record<string, string>
): string {
  if (adapter === 'sqlite') {
    return fields.path || ':memory:'
  }
  if (adapter === 'mongodb') {
    return (
      fields.connectionString ||
      `mongodb://localhost:27017/${
        fields.database || 'metabuilder'
      }`
    )
  }
  const user = fields.user || ''
  const password = fields.password || ''
  const host = fields.host || 'localhost'
  const port =
    fields.port || DEFAULT_PORTS[adapter] || ''
  const database = fields.database || 'metabuilder'
  const auth = user
    ? `${user}${password ? ':' + password : ''}@`
    : ''
  const portPart = port ? ':' + port : ''
  return `${adapter}://${auth}${host}${portPart}/${database}`
}

export function getFieldPlaceholder(
  field: string,
  adapter: string
): string {
  if (field === 'host') return 'localhost'
  if (field === 'port') {
    return DEFAULT_PORTS[adapter] || ''
  }
  if (field === 'database') return 'metabuilder'
  if (field === 'path') return ':memory:'
  if (field === 'connectionString') {
    return 'mongodb://user:pass@host:27017/db'
  }
  return ''
}

export function useSwitchDatabaseTab() {
  const dispatch =
    useAppDispatch() as any as AppDispatch &
      ((action: any) => Promise<any>)
  const [selectedAdapter, setSelectedAdapter] =
    useState('sqlite')
  const [formFields, setFormFields] = useState<
    Record<string, string>
  >({})
  const [testResult, setTestResult] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const [switchResult, setSwitchResult] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const [testing, setTesting] = useState(false)
  const [switching, setSwitching] = useState(false)

  const handleAdapterChange = (value: string) => {
    setSelectedAdapter(value)
    setFormFields({})
    setTestResult(null)
    setSwitchResult(null)
  }

  const handleFieldChange = (
    field: string,
    value: string
  ) => {
    setFormFields((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const url = buildUrl(selectedAdapter, formFields)
      const result = await (
        dispatch(
          testDBALConnectionThunk({
            adapter: selectedAdapter,
            databaseUrl: url,
          }) as any
        ) as Promise<any>
      )
      const payload = result?.payload
      if (payload) {
        setTestResult({
          ok: payload.success,
          message: payload.message,
        })
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: String(err) || 'Test failed',
      })
    } finally {
      setTesting(false)
    }
  }

  const handleApply = async () => {
    setSwitching(true)
    setSwitchResult(null)
    try {
      const url = buildUrl(selectedAdapter, formFields)
      await (
        dispatch(
          switchDBALDatabase({
            adapter: selectedAdapter,
            databaseUrl: url,
          }) as any
        ) as Promise<any>
      )
      setSwitchResult({
        ok: true,
        message: 'Switched successfully',
      })
      dispatch(checkDBALConnection() as any)
      dispatch(fetchDBALAdapters() as any)
    } catch (err: any) {
      setSwitchResult({
        ok: false,
        message: String(err) || 'Switch failed',
      })
    } finally {
      setSwitching(false)
    }
  }

  const fields = ADAPTER_FIELDS[selectedAdapter] || []

  return {
    selectedAdapter,
    formFields,
    testResult,
    switchResult,
    testing,
    switching,
    fields,
    handleAdapterChange,
    handleFieldChange,
    handleTest,
    handleApply,
  }
}
