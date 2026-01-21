export interface InfoItem {
  label: string
  value: string
}

export interface InfoSectionProps {
  title: string
  description: string
  items: InfoItem[]
}
