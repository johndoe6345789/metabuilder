'use client';

import { createContext, useContext } from 'react';
import { classNames } from '../utils';
import styles from './Tabs.module.scss';

const TabsContext = createContext({ activeTab: '', setActiveTab: () => {} });

export function Tabs({ children, value, onChange, className }) {
  return (
    <TabsContext.Provider value={{ activeTab: value, setActiveTab: onChange }}>
      <div className={classNames(styles.tabs, className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }) {
  return (
    <div className={classNames(styles.tabList, className)} role="tablist">
      {children}
    </div>
  );
}

export function Tab({ children, value, className }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={classNames(styles.tab, isActive && styles['tab--active'], className)}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabPanel({ children, value, className }) {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={classNames(styles.tabPanel, className)}>
      {children}
    </div>
  );
}
