import React from 'react';
import styles from './RetroGif.module.scss';

// Using archive.org hosted classic 90s gifs
const GIF_SOURCES = {
  underConstruction: 'https://web.archive.org/web/20091027010629im_/http://geocities.com/js_source/uc.gif',
  underConstruction2: 'https://web.archive.org/web/20091027010629im_/http://geocities.com/SiliconValley/Park/6543/underconstruction.gif',
  email: 'https://web.archive.org/web/20091027065743im_/http://www.geocities.com/SunsetStrip/Venue/8232/emailme2.gif',
  fire: 'https://web.archive.org/web/20091027003401im_/http://geocities.com/js_source/fire.gif',
  new: 'https://web.archive.org/web/20091027010844im_/http://geocities.com/ResearchTriangle/Forum/1363/new.gif',
  counter: 'https://web.archive.org/web/20091027012438im_/http://www.geocities.com/Heartland/Plains/7646/counter.gif',
  welcome: 'https://web.archive.org/web/20091027003221im_/http://geocities.com/SiliconValley/Way/4302/welcome5.gif',
  dividerRainbow: 'https://web.archive.org/web/20091027010629im_/http://geocities.com/EnchantedForest/Glade/1274/rainbow.gif',
  guestbook: 'https://web.archive.org/web/20091027010348im_/http://geocities.com/EnchantedForest/Dell/4250/guestbook.gif',
  dancing: 'https://web.archive.org/web/20091027004205im_/http://geocities.com/SiliconValley/Hills/5765/babydan.gif',
  skull: 'https://web.archive.org/web/20091027002812im_/http://geocities.com/Area51/Zone/7492/skullani.gif',
  spinning3d: 'https://web.archive.org/web/20091027012156im_/http://geocities.com/ResearchTriangle/6640/at3.gif',
  coolSite: 'https://web.archive.org/web/20091027003506im_/http://geocities.com/SunsetStrip/Palladium/9782/cool.gif',
  netscape: 'https://web.archive.org/web/20091027001652im_/http://www.geocities.com/SiliconValley/Platform/4483/netscape.gif',
  ielogo: 'https://web.archive.org/web/20091027011037im_/http://geocities.com/SiliconValley/Pines/6818/msielogo.gif',
  hotSite: 'https://web.archive.org/web/20091026235944im_/http://geocities.com/Heartland/Hills/9498/hot.gif',
} as const;

// Fallback inline SVGs for when archive.org is slow/unavailable
const FALLBACK_SVGS: Record<string, string> = {
  underConstruction: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 31">
      <rect fill="#ff0" width="88" height="31"/>
      <text x="44" y="20" text-anchor="middle" font-family="Arial" font-size="10" fill="#000">🚧 UNDER</text>
      <text x="44" y="28" text-anchor="middle" font-family="Arial" font-size="8" fill="#000">CONSTRUCTION</text>
    </svg>
  `)}`,
  fire: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30">
      <text x="10" y="20" text-anchor="middle" font-size="20">🔥</text>
    </svg>
  `)}`,
  email: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
      <text x="30" y="20" text-anchor="middle" font-size="16">📧 EMAIL</text>
    </svg>
  `)}`,
  default: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <rect fill="#c0c0c0" width="40" height="40" stroke="#808080"/>
      <text x="20" y="25" text-anchor="middle" font-size="20">?</text>
    </svg>
  `)}`,
};

type GifType = keyof typeof GIF_SOURCES;

interface RetroGifProps {
  type: GifType;
  alt?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const RetroGif: React.FC<RetroGifProps> = ({ 
  type, 
  alt,
  className = '',
  size = 'medium'
}) => {
  const src = GIF_SOURCES[type];
  const fallback = FALLBACK_SVGS[type] || FALLBACK_SVGS.default;
  const altText = alt || type.replace(/([A-Z])/g, ' $1').trim();

  return (
    <img 
      src={src}
      alt={altText}
      className={`${styles.retroGif} ${styles[size]} ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallback;
      }}
      loading="lazy"
    />
  );
};

export { GIF_SOURCES };
export type { GifType };
