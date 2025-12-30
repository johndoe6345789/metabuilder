// Title validation: 1-255 characters
export function isValidTitle(title: string): boolean {
  return title.length > 0 && title.length <= 255
}
