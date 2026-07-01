'use client'

import { useState, useEffect } from 'react'
import {
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@/m3'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface PackageRecord {
  packageId: string
  name: string
  version: string
  category: string
  level: number
}

const FALLBACK_PACKAGES: PackageRecord[] = [
  {
    packageId: 'analytics',
    name: 'Analytics Studio',
    version: '1.0.0',
    category: 'admin',
    level: 3,
  },
  {
    packageId: 'blog',
    name: 'Blog',
    version: '1.0.0',
    category: 'social',
    level: 2,
  },
  {
    packageId: 'god_panel',
    name: 'God Panel',
    version: '1.0.0',
    category: 'admin',
    level: 4,
  },
]

export function PackagesTab() {
  const [packages, setPackages] = useState<PackageRecord[]>([])

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/package`, {
      signal: AbortSignal.timeout(5000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: PackageRecord[] } | null) => {
        setPackages(json?.data ?? FALLBACK_PACKAGES)
      })
      .catch(() => { setPackages(FALLBACK_PACKAGES) })
  }, [])

  return (
    <div>
      <Typography variant="h6" gutterBottom>Package Manager</Typography>
      <Typography variant="body2" color="text.secondary">
        62 packages across Admin, UI Core, Dev Tools, Features, Testing.
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Package</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map(pkg => (
              <TableRow key={pkg.packageId}>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>
                  <Chip label={pkg.version} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={pkg.category} size="small" />
                </TableCell>
                <TableCell>{pkg.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
