// Deterministic hue per id (channel/station), so each one gets a stable
// color identity across the hub — hero glow, card accents — without
// needing real artwork. Shared so the hero and the guide/list agree.
export function hueFor(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash % 360
}
