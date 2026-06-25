'use client';

import React, { useState, useEffect } from 'react';
import { RetroButton } from '@/components/atoms/RetroButton';
import { BlinkText } from '@/components/atoms/BlinkText';
import { RainbowText } from '@/components/atoms/RainbowText';
import { RetroGif } from '@/components/atoms/RetroGif';
import styles from './SplashScreen.module.scss';

interface SplashScreenProps {
  onEnter: () => void;
  visitorCount: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, visitorCount }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [cursorTrail, setCursorTrail] = useState<Array<{x: number, y: number, id: number}>>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWarning(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }];
        return newTrail.slice(-20);
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorTrail(prev => prev.slice(1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.splash}>
      {/* Cursor trail */}
      {cursorTrail.map((point, i) => (
        <div 
          key={point.id}
          className={styles.cursorStar}
          style={{ 
            left: point.x, 
            top: point.y,
            opacity: i / cursorTrail.length,
            transform: `scale(${0.5 + (i / cursorTrail.length) * 0.5})`
          }}
        >
          ✨
        </div>
      ))}

      {/* Starfield background effect */}
      <div className={styles.stars}></div>
      <div className={styles.stars2}></div>
      
      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.topGifs}>
          <RetroGif type="skull" size="large" />
          <RetroGif type="fire" size="large" />
          <RetroGif type="skull" size="large" />
        </div>
        
        <h1 className={styles.title}>
          <RainbowText>~*~WELCOME~*~</RainbowText>
        </h1>
        
        <h2 className={styles.subtitle}>
          <BlinkText color="#00ffff" speed="slow">TO</BlinkText>
        </h2>
        
        <h1 className={styles.siteTitle}>
          <span className={styles.glitch} data-text="RiChArDs HoMePaGe">
            RiChArDs HoMePaGe
          </span>
        </h1>
        
        <div className={styles.dancing}>
          <RetroGif type="dancing" size="large" />
          <RetroGif type="dancing" size="large" />
          <RetroGif type="dancing" size="large" />
        </div>
        
        <div className={styles.enterSection}>
          <p className={styles.enterText}>
            <BlinkText color="#ff00ff">★</BlinkText>
            {' '}ClIcK tO eNtEr ThE sItE{' '}
            <BlinkText color="#ff00ff">★</BlinkText>
          </p>
          
          <RetroButton onClick={onEnter} variant="primary" size="large">
            🚀 ENTER 🚀
          </RetroButton>
          
          <p className={styles.visitorText}>
            YoU wIlL bE vIsItOr #{visitorCount + 1}!
          </p>
        </div>
        
        {showWarning && (
          <div className={styles.warning}>
            <BlinkText color="#ff0000" speed="fast">⚠️ WARNING ⚠️</BlinkText>
            <p>ThIs SiTe CoNtAiNs:</p>
            <ul>
              <li>🔥 AnImAtEd GiFs</li>
              <li>🌈 RaInBoW tExT</li>
              <li>✨ BlInKiNg ThInGs</li>
              <li>🎵 MaYbE sOuNd (JK nO aUtOpLaY)</li>
            </ul>
          </div>
        )}
        
        <div className={styles.bottomSection}>
          <RetroGif type="underConstruction" size="medium" />
          <p className={styles.construction}>
            SiTe AlWaYs UnDeR cOnStRuCtIoN!!!
          </p>
          <RetroGif type="underConstruction2" size="medium" />
        </div>
        
        <div className={styles.browserBadges}>
          <p>BeSt ViEwEd WiTh:</p>
          <div className={styles.badges}>
            <RetroGif type="netscape" size="small" />
            <RetroGif type="ielogo" size="small" />
          </div>
          <p className={styles.resolution}>800 x 600 • 256 CoLoRs</p>
        </div>
      </div>
    </div>
  );
};
