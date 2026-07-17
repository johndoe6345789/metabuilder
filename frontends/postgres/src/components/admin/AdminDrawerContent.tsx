'use client';

import AccountTreeIcon from '@metabuilder/components/m3/AccountTree';
import CodeIcon from '@metabuilder/components/m3/Code';
import RuleIcon from '@metabuilder/components/m3/Rule';
import SpeedIcon from '@metabuilder/components/m3/Speed';
import StorageIcon from '@metabuilder/components/m3/Storage';
import TableChartIcon from '@metabuilder/components/m3/TableChart';
import ViewColumnIcon from '@metabuilder/components/m3/ViewColumn';
import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@metabuilder/components/m3';
import styles from './admin-drawer-content.module.scss';

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
  const t = useTranslations('Admin');
  return (
    <>
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
              <ListItemText primary={t(`nav.${item.id}`)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box className={styles.section}>
        <Typography variant="caption" className={styles.labelWide}>
          {t('footer.title')}
        </Typography>
        <Typography variant="caption" className={styles.version}>
          v{version}
        </Typography>
      </Box>
    </>
  );
}
