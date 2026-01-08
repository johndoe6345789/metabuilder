import type { ComponentType, ReactElement } from 'react'

import {
  AccountCircle,
  Article,
  Autorenew,
  Chat,
  Checkbox,
  CropFree,
  CropPortrait,
  FormatAlignLeft,
  GridView,
  type IconProps,
  LocalOffer,
  LooksOne,
  Minus,
  TableChart,
  TextFields,
  ToggleOn,
  TouchApp,
  Tune,
  Verified,
  ViewColumn,
  ViewStream,
  WarningAmber,
} from '@/fakemui/icons'

const iconMap: Record<string, ComponentType<IconProps>> = {
  Article,
  Card: CropPortrait,
  Chat,
  CheckSquare: Checkbox,
  CircleNotch: Autorenew,
  Columns: ViewColumn,
  CursorClick: TouchApp,
  FrameCorners: CropFree,
  GridFour: GridView,
  Minus,
  Seal: Verified,
  SlidersHorizontal: Tune,
  Stack: ViewStream,
  Table: TableChart,
  Tag: LocalOffer,
  TextAlignLeft: FormatAlignLeft,
  TextHOne: LooksOne,
  TextT: TextFields,
  ToggleRight: ToggleOn,
  UserCircle: AccountCircle,
  Warning: WarningAmber,
}

export function getComponentIcon(iconName: string, props?: IconProps): ReactElement | null {
  const Icon = iconMap[iconName]
  return Icon !== undefined ? <Icon {...props} /> : null
}
