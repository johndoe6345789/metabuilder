'use client'

import { Card, CardContent, CardHeader } from '@metabuilder/components/fakemui'
import styles from './DemoFeatureCards.module.scss'

export const DemoFeatureCards = () => {
  return (
    <div
      className={styles.grid}
      data-testid="demo-feature-cards"
      role="region"
      aria-label="Feature cards"
    >
      <Card data-testid="feature-card-realtime">
        <CardHeader>
          <h3 className={styles.cardTitle}>Real-Time Updates</h3>
        </CardHeader>
        <CardContent className={styles.cardBody}>
          Watch your React components render instantly as you type. No refresh needed.
        </CardContent>
      </Card>

      <Card data-testid="feature-card-resizable">
        <CardHeader>
          <h3 className={styles.cardTitle}>Resizable Panels</h3>
        </CardHeader>
        <CardContent className={styles.cardBody}>
          Drag the center divider to adjust the editor and preview panel sizes to your preference.
        </CardContent>
      </Card>

      <Card data-testid="feature-card-viewmodes">
        <CardHeader>
          <h3 className={styles.cardTitle}>Multiple View Modes</h3>
        </CardHeader>
        <CardContent className={styles.cardBody}>
          Switch between code-only, split-screen, or preview-only modes with the toggle buttons.
        </CardContent>
      </Card>
    </div>
  )
}
