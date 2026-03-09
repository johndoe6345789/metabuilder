import * as React from 'react'
import * as Babel from '@babel/standalone'
import {
  Button,
  Card, CardContent, CardHeader, CardActions,
  Input, Textarea, Select, MenuItem,
  Checkbox, Switch,
  Chip,
  Tabs, Tab, TabPanel,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogActions,
  Divider, LinearProgress, Slider, Avatar,
  Accordion, AccordionSummary, AccordionDetails,
  FormLabel,
} from '@metabuilder/components/fakemui'
import { toast } from '@metabuilder/components/fakemui'
import * as PhosphorIcons from '@phosphor-icons/react'

export function transformReactCode(code: string, functionName?: string): React.ComponentType | null {
  const cleanedCode = code
    .replace(/^import\s+.*from\s+['"]react['"];?\s*/gm, '')
    .replace(/^import\s+.*from\s+['"].*['"];?\s*/gm, '')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '')

  let componentToReturn = functionName

  if (!componentToReturn) {
    const functionMatch = cleanedCode.match(/(?:function|const|let|var)\s+([A-Z]\w*)/);
    if (functionMatch) {
      componentToReturn = functionMatch[1]
    }
  }

  const transformedResult = Babel.transform(cleanedCode, {
    presets: ['react', 'typescript'],
    filename: 'component.tsx',
  })

  const transformedCode = transformedResult.code || ''

  const wrappedCode = `
    (function() {
      const React = arguments[0];
      const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext } = React;
      const Button = arguments[1];
      const Card = arguments[2];
      const CardContent = arguments[3];
      const CardHeader = arguments[4];
      const CardActions = arguments[5];
      const CardTitle = ({ children, className }) => React.createElement('h3', { className, style: { fontWeight: 600, fontSize: '1.125rem' } }, children);
      const CardDescription = ({ children, className }) => React.createElement('p', { className, style: { color: 'var(--mat-sys-on-surface-variant, #6b7280)', fontSize: '0.875rem' } }, children);
      const CardFooter = CardActions;
      const Input = arguments[6];
      const Label = arguments[7];
      const Textarea = arguments[8];
      const Select = arguments[9];
      const MenuItem = arguments[10];
      const SelectContent = ({ children }) => children;
      const SelectTrigger = ({ children }) => children;
      const SelectValue = () => null;
      const SelectItem = MenuItem;
      const Checkbox = arguments[11];
      const Switch = arguments[12];
      const Chip = arguments[13];
      const Badge = Chip;
      const Tabs = arguments[14];
      const Tab = arguments[15];
      const TabPanel = arguments[16];
      const TabsContent = TabPanel;
      const TabsList = ({ children }) => children;
      const TabsTrigger = Tab;
      const Dialog = arguments[17];
      const DialogContent = arguments[18];
      const DialogHeader = arguments[19];
      const DialogTitle = arguments[20];
      const DialogActions = arguments[21];
      const DialogFooter = DialogActions;
      const DialogDescription = ({ children }) => React.createElement('p', null, children);
      const DialogTrigger = ({ children }) => children;
      const Separator = arguments[22];
      const Divider = Separator;
      const Progress = arguments[23];
      const Slider = arguments[24];
      const Avatar = arguments[25];
      const AvatarFallback = ({ children }) => children;
      const AvatarImage = () => null;
      const Accordion = arguments[26];
      const AccordionSummary = arguments[27];
      const AccordionDetails = arguments[28];
      const AccordionContent = AccordionDetails;
      const AccordionItem = ({ children }) => children;
      const AccordionTrigger = AccordionSummary;
      const toast = arguments[29];
      const PhosphorIcons = arguments[30];
      const { Plus, Minus, ArrowCounterClockwise, PaperPlaneRight, Trash, User, Gear, Bell, MagnifyingGlass } = PhosphorIcons;
      
      ${transformedCode}
      
      ${componentToReturn ? `return ${componentToReturn};` : `
      return null;
      `}
    })
  `

  const componentFactory = eval(wrappedCode)
  const CreatedComponent = componentFactory(
    React,           // [0]
    Button,          // [1]
    Card,            // [2]
    CardContent,     // [3]
    CardHeader,      // [4] → wrappedCode: CardHeader (aliases: CardTitle)
    CardActions,     // [5] → wrappedCode: CardActions (aliases: CardFooter, CardDescription=CardContent)
    Input,           // [6]
    FormLabel,       // [7] → wrappedCode: Label
    Textarea,        // [8]
    Select,          // [9]
    MenuItem,        // [10] → wrappedCode: MenuItem (aliases: SelectItem=MenuItem)
    Checkbox,        // [11]
    Switch,          // [12]
    Chip,            // [13] → wrappedCode: Chip (aliases: Badge=Chip)
    Tabs,            // [14]
    Tab,             // [15]
    TabPanel,        // [16] → wrappedCode: TabPanel (aliases: TabsContent=TabPanel, TabsTrigger=Tab)
    Dialog,          // [17]
    DialogContent,   // [18]
    DialogHeader,    // [19]
    DialogTitle,     // [20]
    DialogActions,   // [21] → wrappedCode: DialogActions (aliases: DialogFooter=DialogActions)
    Divider,         // [22] → wrappedCode: Separator (aliases: Divider=Separator)
    LinearProgress,  // [23] → wrappedCode: Progress
    Slider,          // [24]
    Avatar,          // [25]
    Accordion,       // [26]
    AccordionSummary,   // [27]
    AccordionDetails,   // [28] → wrappedCode: AccordionDetails (aliases: AccordionContent=AccordionDetails)
    toast,           // [29]
    PhosphorIcons    // [30]
  )

  if (typeof CreatedComponent === 'function') {
    return CreatedComponent
  } else if (React.isValidElement(CreatedComponent)) {
    return () => CreatedComponent
  } else if (CreatedComponent === null) {
    throw new Error('No component found. Please specify a function/component name or ensure your code exports a component.')
  } else {
    throw new Error('Code must export a React component or JSX element')
  }
}
