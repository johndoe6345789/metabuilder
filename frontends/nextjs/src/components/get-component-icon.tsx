import type { ReactElement, SVGAttributes } from 'react'

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
} from '@/m3/icons'

type ComponentIconProps = Omit<SVGAttributes<SVGElement>, 'fill'> & {
  fill?: string | number
  weight?: string
}
type ComponentIcon = (props: ComponentIconProps) => ReactElement

const asComponentIcon = (icon: unknown): ComponentIcon => icon as ComponentIcon

// Partial, not Record: iconName is an arbitrary string, and most of
// them aren't a registered icon.
const iconMap: Partial<Record<string, ComponentIcon>> = {
  Article: asComponentIcon(Article),
  Card: asComponentIcon(CropPortrait),
  Chat: asComponentIcon(Chat),
  CheckSquare: asComponentIcon(Checkbox),
  CircleNotch: asComponentIcon(Autorenew),
  Columns: asComponentIcon(ViewColumn),
  CursorClick: asComponentIcon(TouchApp),
  FrameCorners: asComponentIcon(CropFree),
  GridFour: asComponentIcon(GridView),
  Minus: asComponentIcon(Minus),
  Seal: asComponentIcon(Verified),
  SlidersHorizontal: asComponentIcon(Tune),
  Stack: asComponentIcon(ViewStream),
  Table: asComponentIcon(TableChart),
  Tag: asComponentIcon(LocalOffer),
  TextAlignLeft: asComponentIcon(FormatAlignLeft),
  TextHOne: asComponentIcon(LooksOne),
  TextT: asComponentIcon(TextFields),
  ToggleRight: asComponentIcon(ToggleOn),
  UserCircle: asComponentIcon(AccountCircle),
  Warning: asComponentIcon(WarningAmber),
}

export function getComponentIcon(
  iconName: string,
  props?: ComponentIconProps
): ReactElement | null {
  const Icon = iconMap[iconName]
  return Icon !== undefined ? <Icon {...props} /> : null
}
