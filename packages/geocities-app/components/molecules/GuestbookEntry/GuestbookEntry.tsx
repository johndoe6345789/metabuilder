import React from 'react';
import type { GuestbookEntry as GuestbookEntryType } from '@/hooks/useGuestbook';
import styles from './GuestbookEntry.module.scss';

interface GuestbookEntryProps {
  entry: GuestbookEntryType;
}

export const GuestbookEntry: React.FC<GuestbookEntryProps> = ({ entry }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.entry}>
      <div className={styles.header}>
        <span className={styles.name}>{entry.name}</span>
        <span className={styles.date}>{formatDate(entry.date)}</span>
      </div>
      <div className={styles.message}>{entry.message}</div>
      {entry.email && (
        <a href={`mailto:${entry.email}`} className={styles.email}>
          📧 {entry.email}
        </a>
      )}
    </div>
  );
};
