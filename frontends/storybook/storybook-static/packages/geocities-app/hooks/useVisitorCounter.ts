import { useState, useEffect, useCallback } from 'react';
import { useIndexedDB } from './useIndexedDB';

const VISITOR_KEY = 'total_visitors';
const INITIAL_COUNT = 1337; // Start with a believable 90s number

export function useVisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number>(INITIAL_COUNT);
  const [isLoaded, setIsLoaded] = useState(false);
  const { getItem, setItem, isReady } = useIndexedDB('visitors');

  useEffect(() => {
    if (!isReady) return;

    const loadCount = async () => {
      try {
        const record = await getItem(VISITOR_KEY);
        if (record) {
          setVisitorCount(record.count);
        } else {
          await setItem({ id: VISITOR_KEY, count: INITIAL_COUNT });
        }
      } catch (error) {
        console.error('Failed to load visitor count:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCount();
  }, [isReady, getItem, setItem]);

  const incrementVisitor = useCallback(async () => {
    const newCount = visitorCount + 1;
    setVisitorCount(newCount);
    
    try {
      await setItem({ id: VISITOR_KEY, count: newCount });
    } catch (error) {
      console.error('Failed to save visitor count:', error);
    }
    
    return newCount;
  }, [visitorCount, setItem]);

  return { visitorCount, incrementVisitor, isLoaded };
}
