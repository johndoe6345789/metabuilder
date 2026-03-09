/**
 * Example: Config-Driven Dashboard Stats Cards
 * This component demonstrates how to use componentTreeRenderer with features.json
 */
'use client';

import { useState } from 'react';
import { getComponentTree } from '@/utils/featureConfig';
import { ComponentTreeRenderer } from '@/utils/componentTreeRenderer';

export default function DashboardStatsExample() {
  // Get the component tree from features.json
  const tree = getComponentTree('DashboardStatsCards');

  // Prepare data for the component tree
  const [statsData] = useState({
    statsCards: [
      {
        icon: 'People',
        color: 'primary',
        value: '1,234',
        label: 'Total Users',
        change: 12.5,
      },
      {
        icon: 'ShoppingCart',
        color: 'success',
        value: '567',
        label: 'Orders',
        change: 8.3,
      },
      {
        icon: 'AttachMoney',
        color: 'warning',
        value: '$45.2K',
        label: 'Revenue',
        change: -2.1,
      },
      {
        icon: 'TrendingUp',
        color: 'info',
        value: '89%',
        label: 'Growth',
        change: 15.7,
      },
    ],
  });

  // No actions needed for this example
  const actions = {};

  if (!tree) {
    return <div>Component tree not found in features.json</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Config-Driven Dashboard Example</h2>
      <p>
        This component is entirely driven by the componentTrees.DashboardStatsCards 
        definition in features.json. No custom JSX is written for the stats cards!
      </p>
      
      <ComponentTreeRenderer 
        tree={tree} 
        context={{ data: statsData, actions, state: {} }} 
      />
    </div>
  );
}
