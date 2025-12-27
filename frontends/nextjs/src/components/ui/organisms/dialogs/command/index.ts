"use client"

import { CommandDialogRoot, CommandInput } from './CommandDialogShell'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './CommandList'
import { useCommandShortcut } from './useCommandShortcuts'

import type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroup as CommandGroupType,
  CommandGroupProps,
  CommandInputProps,
  CommandItem as CommandItemType,
  CommandItemProps,
  CommandListProps,
  CommandShortcutProps,
} from './command.types'

const CommandDialog = Object.assign(CommandDialogRoot, {
  Input: CommandInput,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Item: CommandItem,
  Separator: CommandSeparator,
  Shortcut: CommandShortcut,
})

export {
  CommandDialog,
  CommandDialogRoot,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  useCommandShortcut,
}

export type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandGroupType,
  CommandInputProps,
  CommandItemProps,
  CommandItemType,
  CommandListProps,
  CommandShortcutProps,
}
