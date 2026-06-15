'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './DebugPanel.module.scss'

interface SandboxSpec {
  runtime: string
  image: string
  adapter: string
}

// Mirrors backend _DEBUG_RUNNERS: each session runs in a throwaway container
// on an internal (no-internet) Docker network, capped at 512 MB / 1 vCPU / 512
// PIDs, speaking the Debug Adapter Protocol over a private socket.
const SANDBOX: Record<string, SandboxSpec> = {
  python: {
    runtime: 'Python 3.11',
    image: 'python-debug:latest',
    adapter: 'debugpy',
  },
  javascript: {
    runtime: 'Node 20',
    image: 'node-debug:latest',
    adapter: 'js-debug',
  },
  typescript: {
    runtime: 'Node 20 · tsx',
    image: 'node-debug:latest',
    adapter: 'js-debug',
  },
  go: {
    runtime: 'Go 1.22',
    image: 'golang:1.22-alpine',
    adapter: 'delve (dlv)',
  },
  'cpp-cmake': {
    runtime: 'g++ -g -O0',
    image: 'cpp-debug:latest',
    adapter: 'codelldb',
  },
}

const LANG_KEY: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  go: 'go',
  'c++': 'cpp-cmake',
  cpp: 'cpp-cmake',
}

function specFor(language: string): SandboxSpec | null {
  const key = LANG_KEY[language.toLowerCase()]
  return key ? SANDBOX[key] : null
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className={styles.sbRow}>
      <span className={styles.sbKey}>{k}</span>
      <span className={styles.sbVal}>{v}</span>
    </div>
  )
}

/** "Nerd info" card describing the throwaway Docker sandbox a run uses. */
export function DebugSandboxInfo({ language }: { language: string }) {
  const spec = specFor(language)
  if (!spec) return null
  return (
    <div className={styles.sandbox} data-testid="debug-sandbox-info">
      <div className={styles.sbHead}>
        <MaterialIcon name="dns" size={13} aria-hidden="true" />
        <span>debug sandbox</span>
        <span className={styles.sbDot} title="ephemeral" />
      </div>
      <Row k="runtime" v={spec.runtime} />
      <Row k="image" v={spec.image} />
      <Row k="adapter" v={`${spec.adapter} · DAP`} />
      <Row k="isolation" v="throwaway container · no internet" />
      <Row k="limits" v="512 MB · 1 vCPU · 512 PIDs" />
      <p className={styles.sbNote}>
        Every run spins up a fresh, network-isolated container and tears it down
        when you stop.
      </p>
    </div>
  )
}
