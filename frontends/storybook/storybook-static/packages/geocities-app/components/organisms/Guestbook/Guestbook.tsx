'use client';

import React from 'react';
import { GuestbookForm } from '@/components/molecules/GuestbookForm';
import { GuestbookEntry } from '@/components/molecules/GuestbookEntry';
import { RetroGif } from '@/components/atoms/RetroGif';
import { BlinkText } from '@/components/atoms/BlinkText';
import type { GuestbookEntry as GuestbookEntryType } from '@/hooks/useGuestbook';
import styles from './Guestbook.module.scss';

interface GuestbookProps {
  entries: GuestbookEntryType[];
  onSubmit: (name: string, message: string, email?: string) => void;
  isLoaded: boolean;
}

export const Guestbook: React.FC<GuestbookProps> = ({ 
  entries, 
  onSubmit,
  isLoaded 
}) => {
  return (
    <section id="guestbook" className={styles.guestbook}>
      <div className={styles.header}>
        <RetroGif type="guestbook" size="medium" />
        <h2 className={styles.title}>
          <BlinkText color="#ff0000" speed="slow">📖</BlinkText>
          {' '}GuEsTbOoK{' '}
          <BlinkText color="#ff0000" speed="slow">📖</BlinkText>
        </h2>
        <RetroGif type="guestbook" size="medium" />
      </div>
      
      <p className={styles.intro}>
        PlEaSe SiGn My GuEsTbOoK aNd LeT mE kNoW wHaT yOu ThInK oF mY sItE!!!
        I LoVe ReAdInG aLl YoUr MeSsAgEs!!! 💕
      </p>
      
      <GuestbookForm onSubmit={onSubmit} />
      
      <div className={styles.entries}>
        <h3 className={styles.entriesTitle}>
          📜 PrEvIoUs EnTrIeS ({entries.length}) 📜
        </h3>
        
        {!isLoaded ? (
          <div className={styles.loading}>
            <RetroGif type="spinning3d" size="medium" />
            <p>LoAdInG...</p>
          </div>
        ) : entries.length === 0 ? (
          <p className={styles.noEntries}>
            No EnTrIeS yEt! Be ThE fIrSt To SiGn!!!
          </p>
        ) : (
          <div className={styles.entryList}>
            {entries.map(entry => (
              <GuestbookEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
