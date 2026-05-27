import styles from './snippet-dialog-tabs.module.scss'

interface DialogTabBarProps {
  tabs: string[]
  activeTab: number
  onTabChange: (i: number) => void
}

export function DialogTabBar({
  tabs,
  activeTab,
  onTabChange,
}: DialogTabBarProps) {
  return (
    <nav
      role="tablist"
      aria-label="Snippet editor sections"
      className={styles.tabBar}
    >
      {tabs.map((label, i) => (
        <button
          key={label}
          role="tab"
          id={`snippet-tab-${i}-btn`}
          data-testid={`snippet-tab-${i}-btn`}
          aria-selected={activeTab === i}
          aria-controls={`snippet-tab-${i}-panel`}
          onClick={() => onTabChange(i)}
          className={
            activeTab === i
              ? `${styles.tabBtn} ${styles.tabBtnActive}`
              : styles.tabBtn
          }
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

interface TabPanelProps {
  active: boolean
  index: number
  children: React.ReactNode
}

/** Renders only when active — avoids mat-mdc-tab-body absolute positioning. */
export function TabPanel({
  active,
  index,
  children,
}: TabPanelProps) {
  if (!active) return null
  return (
    <section
      role="tabpanel"
      id={`snippet-tab-${index}-panel`}
      aria-labelledby={`snippet-tab-${index}-btn`}
    >
      {children}
    </section>
  )
}
