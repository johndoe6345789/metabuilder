import Link from 'next/link'
import { ServerStatusPanel } from './ServerStatusPanel'
import type { Metadata } from 'next'
import styles from './DaemonPage.module.scss'
import data from './data/daemonPage.json'

export const metadata: Metadata = {
  title: 'DBAL Daemon',
  description: 'C++ DBAL daemon overview, architecture, and observability.',
}

export function DBALDaemonPage() {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>DBAL</p>
          <h1 className={styles.title}>C++ Daemon</h1>
          <p className={styles.description}>
            A hardened, sandboxed C++ daemon serves all database
            operations via REST API. It validates every request,
            enforces ACLs, and executes SQL through safe adapters.
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/" className={styles.btnPrimary}>
              Visit daemon docs
            </Link>
            <Link href="/#status" className={styles.btnOutline}>
              Check status
            </Link>
          </div>
        </header>

        <section className={styles.grid3}>
          {data.architectureHighlights.map(item => (
            <article key={item.title} className={styles.card}>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardText}>{item.description}</p>
            </article>
          ))}
        </section>

        <section className={styles.gradientSection}>
          <div className={styles.sectionCol}>
            <h3 className={styles.sectionTitle}>Security First</h3>
            <ul className={styles.sectionList}>
              {data.securityFeatures.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className={styles.sectionText}>
              Future build artifacts expose TCP/Unix socket endpoints
              that your monitoring stack can scrape, while audit logs
              land in a write-only bucket.
            </p>
          </div>
        </section>

        <section className={styles.deploySection}>
          <h3 className={styles.sectionTitle}>Deployment Readiness</h3>
          <div className={styles.grid2}>
            <div>
              <h4 className={styles.subLabel}>Dependencies</h4>
              <p className={styles.subText}>
                C++17, CMake 3.20+, libpq/mysqlclient, SQLite,
                OpenSSL, and Boost.Beast power the daemon stack used
                in Kubernetes/Spark deployments.
              </p>
            </div>
            <div>
              <h4 className={styles.subLabel}>Configuration</h4>
              <p className={styles.subText}>
                {`\`server\`, \`database\`, \`security\`, and
                \`performance\` keys live in
                \`dbal/production/config/production.yaml\`.
                Credentials reference environment secrets, while
                audit paths are write-only.`}
              </p>
            </div>
          </div>
        </section>

        <section id="status" className={styles.statusSection}>
          <ServerStatusPanel />
        </section>
      </div>
    </div>
  )
}
