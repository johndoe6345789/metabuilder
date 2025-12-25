import type { ComponentType, ReactElement } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import {
  AccountCircle,
  Article,
  Autorenew,
  ChatBubbleOutline,
  CheckBoxOutlined,
  CropFree,
  CropSquare,
  FormatAlignLeft,
  GridView,
  Layers,
  LocalOffer,
  Remove,
  TableChart,
  TextFields,
  Title,
  ToggleOn,
  TouchApp,
  Tune,
  Verified,
  ViewColumn,
  WarningAmber,
} from '@mui/icons-material'

const iconMap: Record<string, ComponentType<SvgIconProps>> = {
  Article,
  Card: CropSquare,
  Chat: ChatBubbleOutline,
  CheckSquare: CheckBoxOutlined,
  CircleNotch: Autorenew,
  Columns: ViewColumn,
  CursorClick: TouchApp,
  FrameCorners: CropFree,
  GridFour: GridView,
  Minus: Remove,
  Seal: Verified,
  SlidersHorizontal: Tune,
  Stack: Layers,
  Table: TableChart,
  Tag: LocalOffer,
  TextAlignLeft: FormatAlignLeft,
  TextHOne: Title,
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
