/**
 * Layout components D–T: drawer, glow, hover, modal, panel, popover, tree.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  DrawerProps, GlowCardProps, HoverCardProps,
  ModalProps, PanelProps, PopoverProps,
  TipsCardProps, TreeCardProps,
} from './interfaces'
import drawerDef from '@/components/json-definitions/drawer.json'
import glowCardDef from
  '@/components/json-definitions/glow-card.json'
import hoverCardDef from
  '@/components/json-definitions/hover-card.json'
import modalDef from '@/components/json-definitions/modal.json'
import panelDef from '@/components/json-definitions/panel.json'
import popoverDef from '@/components/json-definitions/popover.json'
import tipsCardDef from
  '@/components/json-definitions/tips-card.json'
import treeCardDef from
  '@/components/json-definitions/tree-card.json'

export const MetabuilderLayoutDrawer =
  createJsonComponent<DrawerProps>(drawerDef)
export const MetabuilderLayoutGlowCard =
  createJsonComponent<GlowCardProps>(glowCardDef)
export const MetabuilderLayoutHoverCard =
  createJsonComponent<HoverCardProps>(hoverCardDef)
export const MetabuilderLayoutModal =
  createJsonComponent<ModalProps>(modalDef)
export const MetabuilderLayoutPanel =
  createJsonComponent<PanelProps>(panelDef)
export const MetabuilderWidgetPopover =
  createJsonComponentWithHooks<PopoverProps>(popoverDef, {
    hooks: { state: {
      hookName: 'usePopoverState', args: () => [],
    } },
  })
export const MetabuilderLayoutTipsCard =
  createJsonComponent<TipsCardProps>(tipsCardDef)
export const MetabuilderLayoutTreeCard =
  createJsonComponent<TreeCardProps>(treeCardDef)
