// Command barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export { CommandCore as Command, type CommandProps } from './CommandCore'
export { CommandDialog, CommandInput } from './CommandDialog'
export { CommandList, CommandEmpty, CommandGroup } from './CommandList'
export { CommandItem, CommandSeparator, CommandShortcut, CommandLoading } from './CommandItem'
