/**
 * Help Page - Help and support center
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Link,
  Chip,
  Grid,
  Divider,
} from '@metabuilder/fakemui';
import {
  HelpIcon,
  SearchIcon,
  ChevronDownIcon,
  PlayIcon,
  CodeIcon,
  AccountTreeIcon,
} from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/help.module.scss';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create my first workflow?',
    answer:
      'To create your first workflow, navigate to the Workspaces page and click "New Workspace". Once inside a workspace, click the "New Workflow" button. You can then drag and drop nodes from the palette onto the canvas and connect them to build your automation.',
    category: 'Getting Started',
  },
  {
    id: '2',
    question: 'What programming languages are supported?',
    answer:
      'MetaBuilder supports multiple programming languages for workflow nodes: TypeScript, Python, Go, Rust, and Mojo. You can mix different languages in a single workflow, and the executor will handle the execution seamlessly.',
    category: 'Workflows',
  },
  {
    id: '3',
    question: 'How do I connect nodes in a workflow?',
    answer:
      'To connect nodes, click and drag from the output port of one node to the input port of another node. The connection will be created automatically. You can delete connections by selecting them and pressing the Delete key.',
    category: 'Workflows',
  },
  {
    id: '4',
    question: 'Can I share workflows with my team?',
    answer:
      'Yes! Workspaces and workflows support multi-tenant access. You can invite team members to your workspace and collaborate on workflows together. Use the sharing settings in the workspace menu to manage access.',
    category: 'Collaboration',
  },
  {
    id: '5',
    question: 'How do I debug a failing workflow?',
    answer:
      'When a workflow fails, click on the failed node to view its execution logs and error messages. You can also use the step-through debugger to execute nodes one at a time and inspect intermediate results.',
    category: 'Troubleshooting',
  },
  {
    id: '6',
    question: 'What are templates and how do I use them?',
    answer:
      'Templates are pre-built workflows that you can use as starting points for common automation tasks. Browse the Templates page to find workflows for data processing, API integration, AI automation, and more. Click "Use Template" to create a copy in your workspace.',
    category: 'Getting Started',
  },
  {
    id: '7',
    question: 'How do I set up environment variables?',
    answer:
      'Environment variables can be configured in the Workspace settings. Navigate to your workspace, click the settings icon, and go to the "Environment" tab. Add your key-value pairs there, and they will be available to all workflows in that workspace.',
    category: 'Configuration',
  },
  {
    id: '8',
    question: 'Can workflows run on a schedule?',
    answer:
      'Yes! Workflows support scheduled execution using cron expressions. In the workflow settings, enable "Scheduled Execution" and enter your cron schedule. The workflow will run automatically at the specified times.',
    category: 'Workflows',
  },
];

const quickLinks = [
  { title: 'Documentation', href: '/docs', icon: <CodeIcon /> },
  { title: 'Video Tutorials', href: '/tutorials', icon: <PlayIcon /> },
  { title: 'API Reference', href: '/api-docs', icon: <AccountTreeIcon /> },
  { title: 'Community Forum', href: '/community', icon: <HelpIcon /> },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <Box className={styles.helpPage} data-testid="help-page">
      {/* Page Header */}
      <Box className={styles.pageHeader} data-testid="help-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--mat-sys-tertiary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HelpIcon size={24} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom={false}>
              Help & Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find answers to common questions and get started with workflows
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon size={20} />,
          }}
          sx={{ maxWidth: 600, mt: 2 }}
          data-testid="help-search"
        />
      </Box>

      {/* Quick Links */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Links
        </Typography>
        <Grid container spacing={2}>
          {quickLinks.map((link) => (
            <Grid item xs={12} sm={6} md={3} key={link.title}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                data-testid={`quick-link-${link.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      color: 'var(--mat-sys-primary)',
                      mb: 1,
                    }}
                  >
                    {link.icon}
                  </Box>
                  <Link href={link.href} underline="none">
                    <Typography variant="subtitle1">{link.title}</Typography>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Getting Started Guide */}
      <Box sx={{ mb: 4 }}>
        <Card data-testid="getting-started-card">
          <CardHeader title="Getting Started" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              New to MetaBuilder? Follow these steps to create your first workflow:
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Create a workspace:</strong> Navigate to the dashboard and click "New Workspace" to
                organize your projects.
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Start a new workflow:</strong> Inside your workspace, click "New Workflow" to open
                the visual editor.
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Add nodes:</strong> Drag nodes from the palette on the left onto the canvas.
                Each node represents a step in your automation.
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Connect nodes:</strong> Click and drag from output ports to input ports to create
                connections between nodes.
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Configure and run:</strong> Click on nodes to configure their settings, then hit
                the play button to execute your workflow.
              </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" data-testid="view-tutorials-btn">
                View Video Tutorials
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Video Tutorial Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Video Tutorials
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card data-testid="video-tutorial-1">
              <CardContent>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor: 'var(--mat-sys-surface-variant)',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <PlayIcon size={48} />
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  Creating Your First Workflow
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Learn the basics of building workflows with our step-by-step video guide.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card data-testid="video-tutorial-2">
              <CardContent>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor: 'var(--mat-sys-surface-variant)',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <PlayIcon size={48} />
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  Advanced Node Techniques
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Master advanced features like custom nodes, error handling, and debugging.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* FAQ Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Frequently Asked Questions
        </Typography>

        {/* Category Filters */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            onClick={() => setSearchQuery('')}
            color={searchQuery === '' ? 'primary' : 'default'}
            data-testid="filter-all"
          />
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSearchQuery(category)}
              color={searchQuery === category ? 'primary' : 'default'}
              data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
            />
          ))}
        </Box>

        {/* FAQ Accordions */}
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No results found for "{searchQuery}". Try a different search term.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box data-testid="faq-list">
            {filteredFAQs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expandedAccordion === faq.id}
                onChange={handleAccordionChange(faq.id)}
                data-testid={`faq-${faq.id}`}
              >
                <AccordionSummary
                  expandIcon={<ChevronDownIcon />}
                  aria-controls={`faq-${faq.id}-content`}
                  id={`faq-${faq.id}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      {faq.question}
                    </Typography>
                    <Chip label={faq.category} size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      {/* Contact Support */}
      <Card data-testid="contact-support-card">
        <CardHeader title="Still Need Help?" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Can't find what you're looking for? Our support team is here to help.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" data-testid="contact-support-btn">
              Contact Support
            </Button>
            <Button variant="outlined" data-testid="community-forum-btn">
              Join Community Forum
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
