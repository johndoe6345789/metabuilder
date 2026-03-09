import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { SponsorConfig } from '@/config/sponsors';
import { styles } from '@/config/styles';

type SponsorSectionProps = {
  sponsors: SponsorConfig[];
  namespace: string;
};

export function SponsorSection({ sponsors, namespace }: SponsorSectionProps) {
  const t = useTranslations(namespace);

  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`${styles.spacing.marginTop5} ${styles.text.centerSmall}`}>
        {sponsors.map((sponsor, index) => (
          <span key={sponsor.id}>
            {index > 0 && ' - '}
            {`${t(sponsor.translationKey)} `}
            <a
              className={styles.links.primary}
              href={sponsor.url}
            >
              {sponsor.name}
            </a>
          </span>
        ))}
      </div>

      {sponsors
        .filter(sponsor => sponsor.logo.src && sponsor.logo.width > 0 && sponsor.logo.height > 0)
        .map(sponsor => (
          <a
            key={sponsor.id}
            href={sponsor.url}
          >
            <Image
              className={styles.image.centerMarginTop}
              src={sponsor.logo.src}
              alt={sponsor.logo.alt}
              width={sponsor.logo.width}
              height={sponsor.logo.height}
            />
          </a>
        ))}
    </>
  );
}
