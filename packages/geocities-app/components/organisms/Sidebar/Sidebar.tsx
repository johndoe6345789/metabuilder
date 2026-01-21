import React from 'react';
import { NavLink } from '@/components/molecules/NavLink';
import { RetroGif } from '@/components/atoms/RetroGif';
import { VisitorCounter } from '@/components/molecules/VisitorCounter';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  visitorCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ visitorCount }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📍 NaViGaTiOn 📍</h3>
        <nav className={styles.nav}>
          <NavLink href="#home" icon="🏠">HoMe</NavLink>
          <NavLink href="#about" icon="👤">AbOuT mE</NavLink>
          <NavLink href="#links" icon="🔗" isHot>CoOl LiNkS</NavLink>
          <NavLink href="#guestbook" icon="📖">GuEsTbOoK</NavLink>
          <NavLink href="#updates" icon="📰" isNew>UpDaTeS</NavLink>
        </nav>
      </div>
      
      <div className={styles.divider}>
        <RetroGif type="dividerRainbow" size="medium" />
      </div>
      
      <div className={styles.section}>
        <VisitorCounter count={visitorCount} />
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🏆 AwArDs 🏆</h3>
        <div className={styles.awards}>
          <RetroGif type="coolSite" size="medium" />
          <RetroGif type="hotSite" size="medium" />
        </div>
      </div>
      
      <div className={styles.divider}>
        <RetroGif type="dividerRainbow" size="medium" />
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🌐 BeSt ViEwEd WiTh 🌐</h3>
        <div className={styles.browsers}>
          <RetroGif type="netscape" size="small" />
          <RetroGif type="ielogo" size="small" />
        </div>
        <p className={styles.browserNote}>800x600 resolution</p>
      </div>
      
      <div className={styles.section}>
        <div className={styles.construction}>
          <RetroGif type="underConstruction" size="medium" />
          <p>ThIs SiTe Is AlWaYs<br/>UnDeR cOnStRuCtIoN!</p>
          <RetroGif type="underConstruction2" size="medium" />
        </div>
      </div>
    </aside>
  );
};
