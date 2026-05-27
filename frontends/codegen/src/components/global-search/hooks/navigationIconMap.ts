/**
 * navigationIconMap
 *
 * Maps JSON icon name strings to FakeMUI icon
 * components used in global-search navigation items.
 */

import {
  BookOpen,
  ChartBar,
  Code,
  Cube,
  Database,
  DeviceMobile,
  Faders,
  FileText,
  Flask,
  FlowArrow,
  Gear,
  Image,
  Lightbulb,
  PaintBrush,
  Play,
  Tree,
  Wrench,
} from '@metabuilder/fakemui/icons'

export const navigationIconMap = {
  BookOpen,
  ChartBar,
  Code,
  Cube,
  Database,
  DeviceMobile,
  Faders,
  FileText,
  Flask,
  FlowArrow,
  Gear,
  Image,
  Lightbulb,
  PaintBrush,
  Play,
  Tree,
  Wrench,
}

export type NavigationIconName =
  keyof typeof navigationIconMap

export interface NavigationMeta {
  id: string
  title: string
  subtitle: string
  category: string
  icon: NavigationIconName
  tab: string
  tags: string[]
}
