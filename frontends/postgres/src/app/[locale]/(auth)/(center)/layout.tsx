import { setRequestLocale } from 'next-intl/server';
import publicStyles from '@/styles/public.module.scss';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className={publicStyles.centeredLayout}>
      {props.children}
    </div>
  );
}
