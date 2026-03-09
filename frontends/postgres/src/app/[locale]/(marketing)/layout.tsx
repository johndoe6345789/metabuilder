import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DemoBanner } from '@/components/DemoBanner';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { NavLink } from '@/components/NavLink';
import { marketingNavigation } from '@/config/navigation';
import { styles } from '@/config/styles';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  return (
    <>
      <DemoBanner />
      <BaseTemplate
        leftNav={(
          <>
            {marketingNavigation.left.map(link => (
              <li key={link.id}>
                <NavLink href={link.href} external={link.external}>
                  {link.label || t(link.translationKey)}
                </NavLink>
              </li>
            ))}
          </>
        )}
        rightNav={(
          <>
            {marketingNavigation.right.map(link => (
              <li key={link.id}>
                <NavLink href={link.href}>
                  {t(link.translationKey)}
                </NavLink>
              </li>
            ))}

            <li>
              <LocaleSwitcher />
            </li>
          </>
        )}
      >
        <div className={styles.containers.contentPadding}>{props.children}</div>
      </BaseTemplate>
    </>
  );
}
