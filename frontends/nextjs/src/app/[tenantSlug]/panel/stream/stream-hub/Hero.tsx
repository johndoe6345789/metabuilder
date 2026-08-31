'use client'

import { useOnAirChannel } from './use-on-air-channel'
import { HeroEmpty } from './HeroEmpty'
import { HeroOnAir } from './HeroOnAir'

export interface HeroProps {
  onWatch: (channelId: string) => void
}

export function Hero({ onWatch }: HeroProps) {
  const onAir = useOnAirChannel()

  if (onAir?.epgNow === undefined) return <HeroEmpty />
  return <HeroOnAir channel={onAir} onWatch={onWatch} />
}
