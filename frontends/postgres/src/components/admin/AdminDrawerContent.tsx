'use client';

import AccountTreeIcon from '@metabuilder/components/fakemui/AccountTree';
import CodeIcon from '@metabuilder/components/fakemui/Code';
import RuleIcon from '@metabuilder/components/fakemui/Rule';
import SpeedIcon from '@metabuilder/components/fakemui/Speed';
import StorageIcon from '@metabuilder/components/fakemui/Storage';
import TableChartIcon from '@metabuilder/components/fakemui/TableChart';
import ViewColumnIcon from '@metabuilder/components/fakemui/ViewColumn';
import type { ComponentType } from 'react';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@metabuilder/components/fakemui';

export type AdminNavItem = {
  id: string;
  label: string;
  icon: string;
};

type Props = {
  navItems: AdminNavItem[];
  selectedIndex: number;
  onNavigate: (id: string) => void;
  version: string;
};

const iconMap: Record<string, ComponentType<any>> = {
  Storage: StorageIcon,
  Code: CodeIcon,
  AccountTree: AccountTreeIcon,
  TableChart: TableChartIcon,
  ViewColumn: ViewColumnIcon,
  Rule: RuleIcon,
  Speed: SpeedIcon,
};

function getIcon(icon: string) {
  const IconComponent = iconMap[icon];
  return IconComponent ? <IconComponent /> : <StorageIcon />;
}

export default function AdminDrawerContent({
  navItems,
  selectedIndex,
  onNavigate,
  version,
}: Props) {
  return (
    <>
      <Box sx={{ px: 2, py: 1.25 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
          Browse
        </Typography>
      </Box>
      <Divider />
      <List disablePadding>
        {navItems.map((item, index) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedIndex === index}
              onClick={() => onNavigate(item.id)}
            >
              <ListItemIcon>
                {getIcon(item.icon)}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}>
          PostgreSQL Admin
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
          v{version}
        </Typography>
      </Box>
    </>
  );
}
