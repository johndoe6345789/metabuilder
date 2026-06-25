import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Hello } from '@/components/Hello';
import publicStyles from '@/styles/public.module.scss';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default function Dashboard() {
  return (
    <div className={publicStyles.dashboardContent}>
      <Hello />
    </div>
  );
}
