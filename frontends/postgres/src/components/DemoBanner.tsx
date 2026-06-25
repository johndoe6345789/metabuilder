import Link from 'next/link';
import publicStyles from '@/styles/public.module.scss';

export const DemoBanner = () => (
  <div className={publicStyles.demoBanner}>
    Live Demo of Next.js Boilerplate -
    {' '}
    <Link href="/sign-up">Explore the Authentication</Link>
  </div>
);
