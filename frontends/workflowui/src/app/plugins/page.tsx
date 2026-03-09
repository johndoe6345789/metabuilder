/**
 * Plugins Page - Plugin management and marketplace
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Breadcrumbs,
  Button,
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/plugins.module.scss';

// Mock plugin data
const MOCK_PLUGINS = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Integrate with GitHub repositories, issues, pull requests, and workflows',
    icon: '🐙',
    color: '#24292e',
    version: '2.1.0',
    category: 'integrations',
    author: 'MetaBuilder Team',
    downloads: 15420,
    rating: 4.8,
    installed: true,
    features: ['Repository management', 'Issue tracking', 'PR automation', 'Workflow triggers'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages, notifications, and automate Slack workflows',
    icon: '💬',
    color: '#4A154B',
    version: '1.8.2',
    category: 'integrations',
    author: 'MetaBuilder Team',
    downloads: 12300,
    rating: 4.7,
    installed: true,
    features: ['Message sending', 'Channel management', 'User mentions', 'File uploads'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI-powered text generation, completion, and embeddings',
    icon: '🤖',
    color: '#10A37F',
    version: '3.2.0',
    category: 'ai',
    author: 'OpenAI',
    downloads: 28900,
    rating: 4.9,
    installed: false,
    features: ['GPT-4 support', 'Text embeddings', 'Function calling', 'Image generation'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Create, read, and update Notion pages and databases',
    icon: '📝',
    color: '#000000',
    version: '1.5.1',
    category: 'integrations',
    author: 'Notion',
    downloads: 8700,
    rating: 4.6,
    installed: false,
    features: ['Database queries', 'Page creation', 'Block management', 'Webhooks'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing, subscriptions, and financial workflows',
    icon: '💳',
    color: '#635BFF',
    version: '2.0.3',
    category: 'payments',
    author: 'Stripe',
    downloads: 11200,
    rating: 4.8,
    installed: false,
    features: ['Payment processing', 'Subscription management', 'Webhooks', 'Customer portal'],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery, templates, and analytics',
    icon: '📧',
    color: '#1A82E2',
    version: '1.9.0',
    category: 'communication',
    author: 'SendGrid',
    downloads: 9800,
    rating: 4.5,
    installed: false,
    features: ['Email sending', 'Template management', 'Analytics', 'List management'],
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases for queries and data management',
    icon: '🐘',
    color: '#336791',
    version: '1.4.0',
    category: 'databases',
    author: 'MetaBuilder Team',
    downloads: 14500,
    rating: 4.7,
    installed: true,
    features: ['SQL queries', 'Transaction support', 'Connection pooling', 'Schema management'],
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Store and retrieve files from Amazon S3 buckets',
    icon: '☁️',
    color: '#FF9900',
    version: '2.3.1',
    category: 'storage',
    author: 'AWS',
    downloads: 16700,
    rating: 4.6,
    installed: false,
    features: ['File upload/download', 'Bucket management', 'Access control', 'Presigned URLs'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Plugins', count: MOCK_PLUGINS.length },
  { id: 'installed', label: 'Installed', count: MOCK_PLUGINS.filter((p) => p.installed).length },
  { id: 'available', label: 'Available', count: MOCK_PLUGINS.filter((p) => !p.installed).length },
];

const CATEGORY_FILTERS = [
  { id: 'integrations', label: 'Integrations' },
  { id: 'ai', label: 'AI' },
  { id: 'payments', label: 'Payments' },
  { id: 'communication', label: 'Communication' },
  { id: 'databases', label: 'Databases' },
  { id: 'storage', label: 'Storage' },
];

export default function PluginsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'installed' | 'available'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<(typeof MOCK_PLUGINS)[0] | null>(null);

  // Filter plugins
  const filteredPlugins = useMemo(() => {
    let filtered = MOCK_PLUGINS;

    // Filter by tab
    if (selectedTab === 'installed') {
      filtered = filtered.filter((p) => p.installed);
    } else if (selectedTab === 'available') {
      filtered = filtered.filter((p) => !p.installed);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedTab, selectedCategory]);

  const handlePluginClick = (plugin: (typeof MOCK_PLUGINS)[0]) => {
    setSelectedPlugin(plugin);
    setDetailDialogOpen(true);
  };

  const handleInstallToggle = () => {
    if (selectedPlugin) {
      // In production, this would call an API
      console.log(`${selectedPlugin.installed ? 'Uninstalling' : 'Installing'} ${selectedPlugin.name}`);
      setDetailDialogOpen(false);
    }
  };

  const stats = {
    totalPlugins: MOCK_PLUGINS.length,
    installedPlugins: MOCK_PLUGINS.filter((p) => p.installed).length,
    totalDownloads: MOCK_PLUGINS.reduce((sum, p) => sum + p.downloads, 0),
  };

  return (
    <Box className={styles.pluginsPage} data-testid="plugins-page">
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '🧩 Plugins', href: '/plugins' },
        ]}
      />

      {/* Header */}
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Typography variant="h3" data-testid="plugins-title">
            Plugin Marketplace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Extend your workflows with powerful plugins and integrations
          </Typography>
          <Box className={styles.stats}>
            <Box className={styles.statItem}>
              <Typography variant="caption">Total Plugins</Typography>
              <Typography variant="h5">{stats.totalPlugins}</Typography>
            </Box>
            <Box className={styles.statItem}>
              <Typography variant="caption">Installed</Typography>
              <Typography variant="h5">{stats.installedPlugins}</Typography>
            </Box>
            <Box className={styles.statItem}>
              <Typography variant="caption">Total Downloads</Typography>
              <Typography variant="h5">{stats.totalDownloads.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Box className={styles.filters}>
        <Box className={styles.searchBar}>
          <TextField
            fullWidth
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="plugins-search"
          />
        </Box>

        <Box className={styles.filterGroup}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedTab === cat.id ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab(cat.id as any)}
              data-testid={`plugin-tab-${cat.id}`}
            >
              {cat.label} ({cat.count})
            </Button>
          ))}
        </Box>

        <Box className={styles.filterGroup}>
          <Button
            variant={selectedCategory === null ? 'contained' : 'outlined'}
            onClick={() => setSelectedCategory(null)}
            size="small"
            data-testid="category-all"
          >
            All Categories
          </Button>
          {CATEGORY_FILTERS.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(cat.id)}
              size="small"
              data-testid={`category-${cat.id}`}
            >
              {cat.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Box className={styles.mainContent}>
        <Typography variant="body2" color="text.secondary" className={styles.resultsCount}>
          Showing {filteredPlugins.length} of {MOCK_PLUGINS.length} plugins
        </Typography>

        {/* Empty State */}
        {filteredPlugins.length === 0 ? (
          <Box className={styles.emptyState}>
            <Typography variant="h1" className={styles.emptyIcon}>
              🔍
            </Typography>
            <Typography variant="h5">No plugins found</Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your filters or search query
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchQuery('');
                setSelectedTab('all');
                setSelectedCategory(null);
              }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : (
          <Box className={styles.gridView} role="list">
            {filteredPlugins.map((plugin) => (
              <Card
                key={plugin.id}
                className={styles.pluginCard}
                onClick={() => handlePluginClick(plugin)}
                data-testid={`plugin-card-${plugin.id}`}
              >
                <Box
                  className={styles.pluginIcon}
                  sx={{ backgroundColor: plugin.color }}
                >
                  <span style={{ fontSize: 32 }}>{plugin.icon}</span>
                </Box>

                <CardContent className={styles.pluginContent}>
                  <Box className={styles.pluginHeader}>
                    <Typography variant="h6" className={styles.pluginTitle}>
                      {plugin.name}
                    </Typography>
                    {plugin.installed && (
                      <Box className={`${styles.pluginBadge} ${styles.installed}`}>
                        ✓ Installed
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body2" className={styles.pluginDescription}>
                    {plugin.description}
                  </Typography>

                  <Box className={styles.pluginMeta}>
                    <Box className={styles.metaItem}>
                      <span>v{plugin.version}</span>
                    </Box>
                    <Box className={styles.metaItem}>
                      <span>⭐ {plugin.rating}</span>
                    </Box>
                    <Box className={styles.metaItem}>
                      <span>⬇️ {plugin.downloads.toLocaleString()}</span>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button variant={plugin.installed ? 'outlined' : 'contained'} fullWidth>
                    {plugin.installed ? 'Configure' : 'Install'}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Plugin Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPlugin && (
          <>
            <DialogTitle>{selectedPlugin.name}</DialogTitle>
            <DialogContent>
              <Box className={styles.dialogContent}>
                <Box
                  className={styles.dialogIcon}
                  sx={{ backgroundColor: selectedPlugin.color }}
                >
                  <span style={{ fontSize: 40 }}>{selectedPlugin.icon}</span>
                </Box>

                <Box className={styles.dialogHeader}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Version {selectedPlugin.version}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      By {selectedPlugin.author}
                    </Typography>
                  </Box>
                  {selectedPlugin.installed && (
                    <Chip label="Installed" color="primary" size="small" />
                  )}
                </Box>

                <Typography variant="body1">{selectedPlugin.description}</Typography>

                <Box className={styles.dialogMeta}>
                  <Box className={styles.metaItem}>
                    <Typography variant="caption">Rating</Typography>
                    <Typography variant="body2">⭐ {selectedPlugin.rating}/5.0</Typography>
                  </Box>
                  <Box className={styles.metaItem}>
                    <Typography variant="caption">Downloads</Typography>
                    <Typography variant="body2">
                      ⬇️ {selectedPlugin.downloads.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box className={styles.metaItem}>
                    <Typography variant="caption">Category</Typography>
                    <Typography variant="body2">{selectedPlugin.category}</Typography>
                  </Box>
                </Box>

                <Box className={styles.dialogSection}>
                  <Typography variant="h6" className={styles.dialogSectionTitle}>
                    Features
                  </Typography>
                  <Box component="ul" className={styles.featureList}>
                    {selectedPlugin.features.map((feature, index) => (
                      <Box key={index} component="li" className={styles.featureItem}>
                        <span>✓</span>
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={handleInstallToggle}
                data-testid="plugin-action-button"
              >
                {selectedPlugin.installed ? 'Uninstall' : 'Install'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
