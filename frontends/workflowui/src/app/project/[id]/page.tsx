/**
 * Project Canvas Page
 * Displays an infinite canvas with workflow cards for spatial arrangement
 * Uses Fakemui components for consistent Material Design 3 UI
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box as BoxComp,
  Stack as StackComp,
  Card as CardComp,
  CardContent as CardContentComp,
  CardActions as CardActionsComp,
  Button as ButtonComp,
  IconButton as IconButtonComp,
  Typography as TypographyComp,
  Chip as ChipComp,
  AppBar as AppBarComp,
  Toolbar as ToolbarComp,
  Container as ContainerComp,
  CircularProgress as CircularProgressComp,
  Tooltip as TooltipComp,
  Grid as GridComp,
  Paper as PaperComp,
  Badge as BadgeComp,
} from '@metabuilder/fakemui'

// Cast to any to avoid JSX component type issues
const Box = BoxComp as any
const Stack = StackComp as any
const Card = CardComp as any
const CardContent = CardContentComp as any
const CardActions = CardActionsComp as any
const Button = ButtonComp as any
const IconButton = IconButtonComp as any
const Typography = TypographyComp as any
const Chip = ChipComp as any
const AppBar = AppBarComp as any
const Toolbar = ToolbarComp as any
const Container = ContainerComp as any
const CircularProgress = CircularProgressComp as any
const Tooltip = TooltipComp as any
const Grid = GridComp as any
const Paper = PaperComp as any
const Badge = BadgeComp as any
import { Pencil, Star, Plus, ArrowUp, ArrowDown, Breadcrumbs } from '@metabuilder/fakemui'
import { useProject, useUI, useProjectWorkflows } from '@metabuilder/hooks'
import { useProjectCanvas } from '../../../hooks/canvas'

export default function ProjectCanvasPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string
  const { currentProject } = useProject()
  const { zoom, pan } = useProjectCanvas()
  const { setLoading, success, error } = useUI()
  const { workflows, isLoading: workflowsLoading, error: workflowsError } = useProjectWorkflows({
    projectId,
    autoLoad: true,
  })
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [canvasZoom, setCanvasZoom] = useState(1)
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 })

  // Show error if workflows failed to load
  useEffect(() => {
    if (workflowsError) {
      error(workflowsError)
    }
  }, [workflowsError, error])

  const handleCardClick = (workflowId: string) => {
    setSelectedCard(workflowId)
    router.push(`/editor/${workflowId}` as any)
  }

  const handleCardDragStart = (e: React.DragEvent, workflowId: string) => {
    setDraggedCard(workflowId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedCard) {
      success('Workflow repositioned')
      setDraggedCard(null)
    }
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'error' => {
    switch (status) {
      case 'published':
      case 'active':
        return 'success'
      case 'draft':
        return 'info'
      case 'paused':
        return 'warning'
      case 'deprecated':
        return 'error'
      default:
        return 'info'
    }
  }

  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case 'published':
      case 'active':
        return 'var(--md-sys-color-success-container)'
      case 'draft':
        return 'var(--md-sys-color-info-container)'
      case 'paused':
        return 'var(--md-sys-color-warning-container)'
      case 'deprecated':
        return 'var(--md-sys-color-error-container)'
      default:
        return 'var(--md-sys-color-surface-variant)'
    }
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  // Loading state
  if (workflowsLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--md-sys-color-surface)',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="textSecondary">
          Loading project canvas...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Box sx={{ flex: 1 }}>
            <Breadcrumbs
              items={[
                { label: '🏠 Workspaces', href: '/' },
                {
                  label: currentProject?.name || 'Project',
                  href: `/project/${projectId}`
                }
              ]}
            />
            <Typography variant="h5" sx={{ mt: 1, mb: 0.5, fontWeight: 600 }}>
              {currentProject?.name || 'Project Canvas'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {workflows.length} workflows • Project ID: {projectId}
            </Typography>
          </Box>

          {/* Toolbar actions */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Add Workflow">
              <Button
                variant="contained"
                startIcon={<Plus />}
                size="small"
              >
                Add
              </Button>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Canvas area */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          backgroundColor: 'var(--md-sys-color-surface)',
          overflow: 'hidden',
          backgroundImage:
            'linear-gradient(90deg, var(--md-sys-color-outline-variant) 1px, transparent 1px), linear-gradient(var(--md-sys-color-outline-variant) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
      >
        {/* Scrollable card container */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
            transformOrigin: '0 0',
            transition: canvasZoom !== 1 ? 'transform 200ms ease-out' : 'none'
          }}
        >
          {/* Grid layout for workflow cards */}
          <Grid
            container
            spacing={3}
            sx={{
              p: 3,
              maxWidth: 'none'
            }}
          >
            {workflows.map((workflow, index) => (
              <Grid item xs={12} sm={6} md={4} key={workflow.id}>
                {/* Workflow Card */}
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 200ms ease-out',
                    borderTop: selectedCard === workflow.id
                      ? '2px solid var(--md-sys-color-primary)'
                      : '1px solid var(--md-sys-color-outline)',
                    borderRight: selectedCard === workflow.id
                      ? '2px solid var(--md-sys-color-primary)'
                      : '1px solid var(--md-sys-color-outline)',
                    borderBottom: selectedCard === workflow.id
                      ? '2px solid var(--md-sys-color-primary)'
                      : '1px solid var(--md-sys-color-outline)',
                    borderLeft: `4px solid ${
                      workflow.status === 'published' || workflow.status === 'active'
                        ? 'var(--md-sys-color-success)'
                        : workflow.status === 'draft'
                          ? 'var(--md-sys-color-primary)'
                          : workflow.status === 'paused'
                            ? 'var(--md-sys-color-warning)'
                            : 'var(--md-sys-color-error)'
                    }`,
                    '&:hover': {
                      elevation: 8,
                      boxShadow: 'var(--md-sys-shadow-4)'
                    }
                  }}
                  onClick={() => handleCardClick(workflow.id)}
                  draggable
                  onDragStart={(e) => handleCardDragStart(e, workflow.id)}
                >
                  {/* Card Header */}
                  <CardContent sx={{ pb: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        {workflow.name}
                      </Typography>
                      <Chip
                        label={workflow.status}
                        size="small"
                        color={getStatusColor(workflow.status)}
                        variant="filled"
                        sx={{
                          textTransform: 'capitalize',
                          backgroundColor: getStatusBackgroundColor(workflow.status)
                        }}
                      />
                    </Stack>

                    {/* Description */}
                    {workflow.description && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2, lineHeight: 1.5 }}
                      >
                        {workflow.description}
                      </Typography>
                    )}
                  </CardContent>

                  {/* Card Footer */}
                  <CardContent sx={{ pt: 0, pb: 1 }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        {workflow.nodeCount} nodes
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Modified {formatDate(workflow.lastModified)}
                      </Typography>
                    </Stack>
                  </CardContent>

                  {/* Card Actions */}
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Tooltip title="Open in editor">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardClick(workflow.id)
                        }}
                      >
                        <Pencil />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add to favorites">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          success('Added to favorites')
                        }}
                      >
                        <Star />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Canvas Toolbar - Floating */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 1,
            backgroundColor: 'var(--md-sys-color-surface)',
            boxShadow: 'var(--md-sys-shadow-3)'
          }}
        >
          <Tooltip title="Zoom In">
            <IconButton
              size="small"
              onClick={() => setCanvasZoom((z) => Math.min(z + 0.1, 2))}
              variant="outlined"
            >
              <ArrowUp />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset Zoom">
            <IconButton
              size="small"
              onClick={() => {
                setCanvasZoom(1)
                setCanvasPan({ x: 0, y: 0 })
              }}
              variant="outlined"
            >
              ↺
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom Out">
            <IconButton
              size="small"
              onClick={() => setCanvasZoom((z) => Math.max(z - 0.1, 0.5))}
              variant="outlined"
            >
              <ArrowDown />
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>
    </Box>
  )
}
