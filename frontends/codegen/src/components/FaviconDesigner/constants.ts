import React from 'react'
import {
  CircleNotch,
  Square,
  Triangle,
  Star,
  Heart,
  Polygon,
  TextT,
  Image as ImageIcon,
  Pencil,
} from '@metabuilder/fakemui/icons'
import presets from '../../data/favicon-designer-presets.json'
import { FaviconDesign, FaviconElement } from './types'

type ElementTypePreset = {
  value: FaviconElement['type']
  label: string
}

type IconComponent = React.ComponentType<{ size?: number | string; weight?: string | number; className?: string }>

type ElementTypeValue = ElementTypePreset['value']

const ELEMENT_TYPE_ICONS: Record<ElementTypeValue, IconComponent> = {
  circle: CircleNotch,
  square: Square,
  triangle: Triangle,
  star: Star,
  heart: Heart,
  polygon: Polygon,
  text: TextT,
  emoji: ImageIcon,
  freehand: Pencil,
}

const elementTypePresets = presets.elementTypes as ElementTypePreset[]
const defaultDesignPreset = presets.defaultDesign as FaviconDesign

export const PRESET_SIZES = presets.presetSizes

export const ELEMENT_TYPES = elementTypePresets.map((preset) => ({
  ...preset,
  icon: ELEMENT_TYPE_ICONS[preset.value],
}))

export const DEFAULT_DESIGN: FaviconDesign = {
  ...defaultDesignPreset,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
