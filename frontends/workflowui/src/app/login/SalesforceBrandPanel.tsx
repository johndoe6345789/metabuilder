/**
 * SalesforceBrandPanel - Left column branding section
 */

'use client';

import React from 'react';
import styles from '/components/layout/salesforce-login.module.scss';

export default function SalesforceBrandPanel() {
  return (
    <div className={styles.salesforceLeft}>
      <div className={styles.salesforceBrand}>
        <h1 className={styles.salesforceLogo}>WorkflowUI</h1>
        <p className={styles.salesforceTagline}>
          Build powerful workflows with visual no-code tools.
        </p>
      </div>
    </div>
  );
}
