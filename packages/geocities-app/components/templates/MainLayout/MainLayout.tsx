'use client';

import React from 'react';
import { Header } from '@/components/organisms/Header';
import { Sidebar } from '@/components/organisms/Sidebar';
import { MainContent } from '@/components/organisms/MainContent';
import { Guestbook } from '@/components/organisms/Guestbook';
import { Footer } from '@/components/organisms/Footer';
import type { GuestbookEntry } from '@/hooks/useGuestbook';
import styles from './MainLayout.module.scss';

interface MainLayoutProps {
  visitorCount: number;
  guestbookEntries: GuestbookEntry[];
  onGuestbookSubmit: (name: string, message: string, email?: string) => void;
  isGuestbookLoaded: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  visitorCount,
  guestbookEntries,
  onGuestbookSubmit,
  isGuestbookLoaded
}) => {
  return (
    <div className={styles.layout}>
      <Header />
      
      <div className={styles.body}>
        <Sidebar visitorCount={visitorCount} />
        
        <div className={styles.mainArea}>
          <MainContent />
          
          <Guestbook 
            entries={guestbookEntries}
            onSubmit={onGuestbookSubmit}
            isLoaded={isGuestbookLoaded}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};
