import React from 'react';
import { BlinkText } from '@/components/atoms/BlinkText';
import { RetroGif } from '@/components/atoms/RetroGif';
import { RainbowText } from '@/components/atoms/RainbowText';
import { WebRing } from '@/components/molecules/WebRing';
import styles from './MainContent.module.scss';

export const MainContent: React.FC = () => {
  return (
    <main className={styles.main}>
      {/* About Section */}
      <section id="about" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <RetroGif type="dancing" size="small" />
          {' '}AbOuT mE{' '}
          <RetroGif type="dancing" size="small" />
        </h2>
        <div className={styles.aboutContent}>
          <div className={styles.aboutPhoto}>
            <div className={styles.photoFrame}>
              <div className={styles.photoPlaceholder}>
                📷
                <br />
                [photo coming soon]
              </div>
            </div>
          </div>
          <div className={styles.aboutText}>
            <p>
              <BlinkText color="#ff0000">HeLLo!!!</BlinkText> My NaMe Is RiChArD aNd I aM fRoM 
              tHe UnItEd KiNgDoM!!! 🇬🇧
            </p>
            <p>
              I LoVe CoMpUtErS, pRoGrAmMiNg, aNd MaKiNg CoOl WeBsItEs LiKe ThIs OnE!!!
            </p>
            <p>
              My FaVoRiTe ThInGs:
            </p>
            <ul className={styles.favoritesList}>
              <li>🖥️ C++ aNd TyPeScRiPt</li>
              <li>🎮 ViDeO gAmEs</li>
              <li>🍗 FrIeD cHiCkEn (especially Popeyes!!!)</li>
              <li>🔧 BuIlDiNg StUfF</li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Links Section */}
      <section id="links" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <RetroGif type="hotSite" size="small" />
          {' '}CoOl LiNkS{' '}
          <RetroGif type="hotSite" size="small" />
        </h2>
        <div className={styles.linksGrid}>
          <a href="https://web.archive.org/web/19990125091252/http://www.geocities.com/" className={styles.coolLink}>
            🌐 GeoCities Archive
          </a>
          <a href="https://www.cameronsworld.net/" className={styles.coolLink}>
            ✨ Cameron's World
          </a>
          <a href="https://theoldnet.com/" className={styles.coolLink}>
            🕰️ The Old Net
          </a>
          <a href="https://poolside.fm/" className={styles.coolLink}>
            🏊 Poolside FM
          </a>
        </div>
        
        <WebRing ringName="90s NoStAlGiA rInG" />
      </section>
      
      {/* Updates Section */}
      <section id="updates" className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <RetroGif type="new" size="small" />
          {' '}LaTeSt UpDaTeS{' '}
          <RetroGif type="new" size="small" />
        </h2>
        <div className={styles.updatesList}>
          <div className={styles.updateItem}>
            <span className={styles.updateDate}>01/21/2026</span>
            <span className={styles.updateText}>
              <RainbowText>SiTe LaUnChEd!!!</RainbowText> WeLcOmE tO mY nEw HoMePaGe!!!
            </span>
          </div>
          <div className={styles.updateItem}>
            <span className={styles.updateDate}>01/20/2026</span>
            <span className={styles.updateText}>
              AdDeD gUeStBoOk - PlEaSe SiGn It!!!
            </span>
          </div>
          <div className={styles.updateItem}>
            <span className={styles.updateDate}>01/19/2026</span>
            <span className={styles.updateText}>
              StArTeD bUiLdInG tHiS aWeSoMe SiTe
            </span>
          </div>
        </div>
      </section>
      
      {/* Email Section */}
      <section className={styles.emailSection}>
        <RetroGif type="email" size="medium" />
        <p className={styles.emailText}>
          EmAiL mE aT: <a href="mailto:webmaster@geocities.example">webmaster@geocities.example</a>
        </p>
        <RetroGif type="email" size="medium" />
      </section>
    </main>
  );
};
