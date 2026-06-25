import * as React from 'react'
import * as Babel from '@babel/standalone'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Input,
  Textarea,
  Select,
  MenuItem,
  Checkbox,
  Switch,
  Chip,
  Tabs,
  Tab,
  TabPanel,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogActions,
  Divider,
  LinearProgress,
  Slider,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormLabel,
} from '@metabuilder/components/m3'
import { toast } from '@metabuilder/components/m3'
import * as PhosphorIcons from '@phosphor-icons/react'
import { buildWrapperCode } from './react-transform-wrapper'

export function transformReactCode(
  code: string,
  functionName?: string,
): React.ComponentType | null {
  const cleanedCode = code
    .replace(/^import\s+.*from\s+['"]react['"];?\s*/gm, '')
    .replace(/^import\s+.*from\s+['"].*['"];?\s*/gm, '')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '')

  let componentToReturn = functionName
  if (!componentToReturn) {
    const m = cleanedCode.match(/(?:function|const|let|var)\s+([A-Z]\w*)/)
    if (m) componentToReturn = m[1]
  }

  const result = Babel.transform(cleanedCode, {
    presets: ['react', 'typescript'],
    filename: 'component.tsx',
  })
  const transformedCode = result.code || ''
  const wrappedCode = buildWrapperCode(transformedCode, componentToReturn)

  const componentFactory = eval(wrappedCode)
  const CreatedComponent = componentFactory(
    React, // [0]
    Button, // [1]
    Card, // [2]
    CardContent, // [3]
    CardHeader, // [4]
    CardActions, // [5]
    Input, // [6]
    FormLabel, // [7]
    Textarea, // [8]
    Select, // [9]
    MenuItem, // [10]
    Checkbox, // [11]
    Switch, // [12]
    Chip, // [13]
    Tabs, // [14]
    Tab, // [15]
    TabPanel, // [16]
    Dialog, // [17]
    DialogContent, // [18]
    DialogHeader, // [19]
    DialogTitle, // [20]
    DialogActions, // [21]
    Divider, // [22]
    LinearProgress, // [23]
    Slider, // [24]
    Avatar, // [25]
    Accordion, // [26]
    AccordionSummary, // [27]
    AccordionDetails, // [28]
    toast, // [29]
    PhosphorIcons, // [30]
  )

  if (typeof CreatedComponent === 'function') return CreatedComponent
  if (React.isValidElement(CreatedComponent)) return () => CreatedComponent
  if (CreatedComponent === null) {
    throw new Error(
      'No component found. Please specify a function/component name ' +
        'or ensure your code exports a component.',
    )
  }
  throw new Error('Code must export a React component or JSX element')
}
