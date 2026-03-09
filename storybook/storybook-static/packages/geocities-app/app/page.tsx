'use client';

import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/templates/SplashScreen';
import { MainLayout } from '@/components/templates/MainLayout';
import { useVisitorCounter } from '@/hooks/useVisitorCounter';
import { useGuestbook } from '@/hooks/useGuestbook';

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { visitorCount, incrementVisitor } = useVisitorCounter();
  const { entries, addEntry, isLoaded } = useGuestbook();

  useEffect(() => {
    const entered = sessionStorage.getItem('hasEntered');
    if (entered === 'true') {
      setHasEntered(true);
    }
    setIsLoading(false);
  }, []);

  const handleEnter = async () => {
    await incrementVisitor();
    sessionStorage.setItem('hasEntered', 'true');
    setHasEntered(true);
  };

  if (isLoading) return null;

  if (!hasEntered) {
    return <SplashScreen onEnter={handleEnter} visitorCount={visitorCount} />;
  }

  return (
    <MainLayout 
      visitorCount={visitorCount} 
      guestbookEntries={entries}
      onGuestbookSubmit={addEntry}
      isGuestbookLoaded={isLoaded}
    />
  );
}
