const iconMap: Record<string, string> = {
  dashboard: 'D',
  live_tv: 'S',
  person: 'P',
  chat: 'C',
  chat_bubble: 'C',
  admin: 'A',
  build: 'G',
  crown: 'S',
  settings: '⚙',
  package: 'K',
  analytics: 'A',
  forum: 'F',
  gallery: 'G',
  blog: 'B',
  guestbook: 'G',
  music: 'M',
  marketplace: 'M',
}

export function iconChar(icon: string): string {
  return iconMap[icon] ?? icon.charAt(0).toUpperCase()
}
