import React from 'react';
import { MarqueeText } from '@/components/atoms/MarqueeText';
import { BlinkText } from '@/components/atoms/BlinkText';
import { RainbowText } from '@/components/atoms/RainbowText';
import { RetroGif } from '@/components/atoms/RetroGif';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <MarqueeText speed="normal">
        ★☆★ WeLcOmE tO mY pErSoNaL hOmEpAgE!!! PlEaSe SiGn My GuEsTbOoK!!! ★☆★ 
        LaSt UpDaTeD: JaNuArY 21, 2026 ★☆★ 
        YoU aRe ViSiToR nUmBeR [COUNTER] ★☆★
      </MarqueeText>
      
      <div className={styles.titleSection}>
        <div className={styles.fireLeft}>
          <RetroGif type="fire" size="large" />
          <RetroGif type="fire" size="large" />
        </div>
        
        <div className={styles.titleContent}>
          <h1 className={styles.title}>
            <RainbowText>~*~RiChArDs HoMePaGe~*~</RainbowText>
          </h1>
          <p className={styles.subtitle}>
            <BlinkText color="#ff00ff">★</BlinkText>
            {' '}ThE cOoLeSt SiTe On ThE wOrLd WiDe WeB{' '}
            <BlinkText color="#ff00ff">★</BlinkText>
          </p>
        </div>
        
        <div className={styles.fireRight}>
          <RetroGif type="fire" size="large" />
          <RetroGif type="fire" size="large" />
        </div>
      </div>
      
      <div className={styles.welcomeGif}>
        <RetroGif type="welcome" size="large" />
      </div>
    </header>
  );
};
