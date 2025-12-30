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
  type IconProps,
} from '@/fakemui/icons'
import type { ComponentType, ReactElement } from 'react'

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
  return Icon ? <Icon {...props} /> : null
}
