/**
 * TabInfo interface and icon imports for tab info map.
 */
import {
  ChartBar,
  Code,
  Database,
  Tree,
  FlowArrow,
  PaintBrush,
  Flask,
  Play,
  BookOpen,
  Cube,
  Wrench,
  FileText,
  Gear,
  DeviceMobile,
  Image,
  Faders,
  Lightbulb,
  PencilRuler,
  Atom,
} from '@metabuilder/fakemui/icons'

export interface TabInfo {
  title: string
  icon: React.ReactNode
  description?: string
}

export const icons = {
  ChartBar, Code, Database, Tree, FlowArrow, PaintBrush,
  Flask, Play, BookOpen, Cube, Wrench, FileText, Gear,
  DeviceMobile, Image, Faders, Lightbulb, PencilRuler, Atom,
}
