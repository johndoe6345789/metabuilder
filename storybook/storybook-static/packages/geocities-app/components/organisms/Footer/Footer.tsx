import React from 'react';
import { RetroGif } from '@/components/atoms/RetroGif';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider}>
        <RetroGif type="dividerRainbow" size="medium" />
      </div>
      
      <div className={styles.content}>
        <p className={styles.copyright}>
          © 1998-2026 RiChArDs HoMePaGe
        </p>
        <p className={styles.disclaimer}>
          ThIs SiTe Is NoT aFfIlIaTeD wItH gEoCiTiEs (R.I.P. 😢)
        </p>
        <p className={styles.made}>
          MaDe WiTh 💕 aNd <span className={styles.notepad}>Notepad.exe</span>
        </p>
        <p className={styles.tech}>
          (AcTuAlLy MaDe WiTh Next.js, React, TypeScript, SASS & IndexedDB 🤫)
        </p>
      </div>
      
      <div className={styles.badges}>
        <RetroGif type="netscape" size="small" />
        <RetroGif type="ielogo" size="small" />
        <div className={styles.customBadge}>
          MADE WITH<br/>NEXT.JS
        </div>
        <div className={styles.customBadge + ' ' + styles.react}>
          POWERED BY<br/>REACT
        </div>
      </div>
    </footer>
  );
};
