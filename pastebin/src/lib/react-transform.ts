import * as React from 'react'
import * as Babel from '@babel/standalone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'
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
      const CardDescription = arguments[4];
      const CardFooter = arguments[5];
      const CardHeader = arguments[6];
      const CardTitle = arguments[7];
      const Input = arguments[8];
      const Label = arguments[9];
      const Textarea = arguments[10];
      const Select = arguments[11];
      const SelectContent = arguments[12];
      const SelectItem = arguments[13];
      const SelectTrigger = arguments[14];
      const SelectValue = arguments[15];
      const Checkbox = arguments[16];
      const Switch = arguments[17];
      const Badge = arguments[18];
      const Tabs = arguments[19];
      const TabsContent = arguments[20];
      const TabsList = arguments[21];
      const TabsTrigger = arguments[22];
      const Dialog = arguments[23];
      const DialogContent = arguments[24];
      const DialogDescription = arguments[25];
      const DialogFooter = arguments[26];
      const DialogHeader = arguments[27];
      const DialogTitle = arguments[28];
      const DialogTrigger = arguments[29];
      const Separator = arguments[30];
      const Progress = arguments[31];
      const Slider = arguments[32];
      const Avatar = arguments[33];
      const AvatarFallback = arguments[34];
      const AvatarImage = arguments[35];
      const Accordion = arguments[36];
      const AccordionContent = arguments[37];
      const AccordionItem = arguments[38];
      const AccordionTrigger = arguments[39];
      const toast = arguments[40];
      const PhosphorIcons = arguments[41];
      const { Plus, Minus, ArrowCounterClockwise, PaperPlaneRight, Trash, User, Gear, Bell, MagnifyingGlass } = PhosphorIcons;
      
      ${transformedCode}
      
      ${componentToReturn ? `return ${componentToReturn};` : `
      return null;
      `}
    })
  `

  const componentFactory = eval(wrappedCode)
  const CreatedComponent = componentFactory(
    React,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Checkbox,
    Switch,
    Badge,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Separator,
    Progress,
    Slider,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    toast,
    PhosphorIcons
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
