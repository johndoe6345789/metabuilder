/**
 * Explicitly registered FakeMUI components.
 * Turbopack dev mode does not reliably resolve these via
 * require.context.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType } from 'react'
import type { UIComponentRegistry } from './component-registry-types'
import {
  Tabs, Tab, TabPanel,
} from '@metabuilder/m3/navigation'
import {
  CardHeader, CardContent, CardActions,
  CardTitle, CardDescription, CardFooter,
} from '@metabuilder/m3/surfaces'
import {
  Button, Switch, Checkbox, Select,
  Input, Textarea, Slider,
} from '@metabuilder/m3/inputs'
import {
  AlertTitle, Dialog, Progress, Skeleton,
} from '@metabuilder/m3/feedback'
import { Tooltip } from '@metabuilder/m3/data-display'
import { Label } from '@metabuilder/m3/atoms'
import {
  DialogContent, DialogHeader, DialogTitle,
  DialogContentText, DialogActions,
} from '@metabuilder/m3/utils'
import {
  Download, Plus, Trash,
  GitBranch as MergeIcon, Database, CheckCircle,
  Refresh, ArrowClockwise, Settings, Search,
  Check, Close, Edit, Warning, Info, CircleCheck,
} from '@metabuilder/m3/icons'
import { JSONUIShowcase } from '@/components/JSONUIShowcase'
import { SchemaEditorWorkspace } from
  '@/components/schema-editor/SchemaEditorWorkspace'

const C = <T>(c: T) => c as unknown as ComponentType<any>

export const fakeMuiExplicitComponents: UIComponentRegistry = {
  'conditional-group':
    React.Fragment as unknown as ComponentType<any>,
  Tabs: C(Tabs), Tab: C(Tab), TabPanel: C(TabPanel),
  CardHeader: C(CardHeader), CardContent: C(CardContent),
  CardActions: C(CardActions), CardTitle: C(CardTitle),
  CardDescription: C(CardDescription),
  CardFooter: C(CardFooter),
  Button: C(Button), AlertTitle: C(AlertTitle),
  Dialog: C(Dialog), DialogContent: C(DialogContent),
  DialogHeader: C(DialogHeader), DialogTitle: C(DialogTitle),
  DialogContentText: C(DialogContentText),
  DialogActions: C(DialogActions),
  Switch: C(Switch), Checkbox: C(Checkbox),
  Select: C(Select), Input: C(Input),
  Textarea: C(Textarea), Slider: C(Slider),
  Label: C(Label), Tooltip: C(Tooltip),
  Progress: C(Progress), Skeleton: C(Skeleton),
  Download: C(Download), Plus: C(Plus), Trash: C(Trash),
  MergeIcon: C(MergeIcon), Database: C(Database),
  CheckCircle: C(CheckCircle), CircleCheck: C(CircleCheck),
  Refresh: C(Refresh), ArrowClockwise: C(ArrowClockwise),
  Settings: C(Settings), Search: C(Search),
  Check: C(Check), Close: C(Close), Edit: C(Edit),
  Warning: C(Warning), Info: C(Info),
  MetabuilderWidgetJSONUIShowcase: C(JSONUIShowcase),
  SchemaEditorWorkspace: C(SchemaEditorWorkspace),
}
