// Title validation: 1-200 characters
// TODO: add tests for isValidTitle (min/max bounds).
export function isValidTitle(title: string): boolean {
  return title.length > 0 && title.length <= 200
}
