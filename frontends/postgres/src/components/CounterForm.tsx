'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CounterValidation } from '@/validations/CounterValidation';
import { BASE_PATH } from '@/lib/app-config';
import publicStyles from '@/styles/public.module.scss';

export const CounterForm = () => {
  const t = useTranslations('CounterForm');
  const form = useForm({
    resolver: zodResolver(CounterValidation),
    defaultValues: {
      increment: 1,
    },
  });
  const router = useRouter();

  const handleIncrement = form.handleSubmit(async (data) => {
    const response = await fetch(`${BASE_PATH}/api/counter`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    await response.json();

    router.refresh();
  });

  return (
    <form onSubmit={handleIncrement}>
      <p>{t('presentation')}</p>
      <div>
        <label className={publicStyles.counterLabel} htmlFor="increment">
          {t('label_increment')}
          <input
            id="increment"
            type="number"
            className={publicStyles.counterInput}
            {...form.register('increment', { valueAsNumber: true })}
          />
        </label>

        {form.formState.errors.increment && (
          <div className={publicStyles.counterError}>
            {t('error_increment_range')}
          </div>
        )}
      </div>

      <div className={publicStyles.counterActions}>
        <button
          className={publicStyles.counterButton}
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {t('button_increment')}
        </button>
      </div>
    </form>
  );
};
