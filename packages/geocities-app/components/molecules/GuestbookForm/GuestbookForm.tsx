'use client';

import React, { useState } from 'react';
import { RetroButton } from '@/components/atoms/RetroButton';
import { RetroInput } from '@/components/atoms/RetroInput';
import { RetroTextarea } from '@/components/atoms/RetroTextarea';
import styles from './GuestbookForm.module.scss';

interface GuestbookFormProps {
  onSubmit: (name: string, message: string, email?: string) => void;
}

export const GuestbookForm: React.FC<GuestbookFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && message) {
      onSubmit(name, message, email || undefined);
      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>
        ✍️ SiGn My GuEsTbOoK! ✍️
      </h3>
      
      {submitted ? (
        <div className={styles.thankYou}>
          <p>🎉 ThAnK yOu FoR sIgNiNg!!! 🎉</p>
          <p>YoUr EnTrY hAs BeEn AdDeD!</p>
        </div>
      ) : (
        <div className={styles.form}>
          <div className={styles.field}>
            <label>YoUr NaMe:</label>
            <RetroInput
              value={name}
              onChange={setName}
              placeholder="Enter your name..."
              required
            />
          </div>
          
          <div className={styles.field}>
            <label>E-mAiL (optional):</label>
            <RetroInput
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
              type="email"
            />
          </div>
          
          <div className={styles.field}>
            <label>YoUr MeSsAgE:</label>
            <RetroTextarea
              value={message}
              onChange={setMessage}
              placeholder="Leave a message..."
              rows={4}
              required
            />
          </div>
          
          <div className={styles.buttonRow}>
            <RetroButton onClick={handleSubmit} variant="primary" size="large">
              📝 SuBmIt 📝
            </RetroButton>
          </div>
        </div>
      )}
    </div>
  );
};
