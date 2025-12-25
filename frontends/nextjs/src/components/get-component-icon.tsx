import type { ComponentType, ReactElement } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import {
  AccountCircle,
  Article,
  Autorenew,
  CropFree,
  CropPortrait,
  FormatAlignLeft,
  GridView,
  Chat,
  CheckBox,
  LooksOne,
  GridView,
  LocalOffer,
  Remove,
  TableChart,
  TextFields,
  ToggleOn,
  TouchApp,
  Tune,
  Verified,
  ViewStream,
  ViewColumn,
  WarningAmber,
} from '@mui/icons-material'

const iconMap: Record<string, ComponentType<SvgIconProps>> = {
  Article,
  Card: CropPortrait,
  Chat,
  CheckSquare: CheckBox,
  CircleNotch: Autorenew,
  Columns: ViewColumn,
  CursorClick: TouchApp,
  FrameCorners: CropFree,
  GridFour: GridView,
  Minus: Remove,
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

export function getComponentIcon(
  iconName: string,
  props?: SvgIconProps
): ReactElement | null {
  const Icon = iconMap[iconName]
  return Icon ? <Icon {...props} /> : null
}
