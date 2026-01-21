import { useState, useEffect, useCallback } from 'react';
import { useIndexedDB } from './useIndexedDB';

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  date: string;
  email?: string;
}

const DEFAULT_ENTRIES: GuestbookEntry[] = [
  {
    id: 'seed-1',
    name: 'SuRfErDuDe1999',
    message: 'CoOl SiTe DuDe!!! ChEcK oUt My PaGe At GeOcItIeS!!!',
    date: '1998-03-15T10:30:00Z',
    email: 'surferdude@aol.com'
  },
  {
    id: 'seed-2', 
    name: 'xX_DaRkAnGeL_Xx',
    message: 'LoVe ThE gRaPhIcS!!! <3 <3 <3',
    date: '1998-04-22T14:15:00Z',
  },
  {
    id: 'seed-3',
    name: 'WebMaster2000',
    message: 'GrEaT uSe Of FrAmEs! HoW dId YoU mAkE tHe AnImAtEd GiFs??',
    date: '1998-06-10T09:45:00Z',
    email: 'webmaster@geocities.com'
  },
  {
    id: 'seed-4',
    name: 'CyBeRpUnK_HaCkEr',
    message: 'ThIs SiTe Is ToTaLlY rAdIcAl!!! KeEp Up ThE gOoD wOrK!!!',
    date: '1999-01-01T00:00:00Z',
  }
];

export function useGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { getAllItems, setItem, isReady } = useIndexedDB('guestbook');

  useEffect(() => {
    if (!isReady) return;

    const loadEntries = async () => {
      try {
        const stored = await getAllItems();
        if (stored.length === 0) {
          // Seed with default entries
          for (const entry of DEFAULT_ENTRIES) {
            await setItem(entry as any);
          }
          setEntries(DEFAULT_ENTRIES);
        } else {
          setEntries(stored as GuestbookEntry[]);
        }
      } catch (error) {
        console.error('Failed to load guestbook:', error);
        setEntries(DEFAULT_ENTRIES);
      } finally {
        setIsLoaded(true);
      }
    };

    loadEntries();
  }, [isReady, getAllItems, setItem]);

  const addEntry = useCallback(async (name: string, message: string, email?: string) => {
    const newEntry: GuestbookEntry = {
      id: `entry-${Date.now()}`,
      name,
      message,
      date: new Date().toISOString(),
      email,
    };

    try {
      await setItem(newEntry as any);
      setEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Failed to add guestbook entry:', error);
    }

    return newEntry;
  }, [setItem]);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return { entries: sortedEntries, addEntry, isLoaded };
}
