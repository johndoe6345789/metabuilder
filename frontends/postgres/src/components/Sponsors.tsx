import Image from 'next/image';
import sponsorsGrid from '@/config/sponsorsGrid.json';
import publicStyles from '@/styles/public.module.scss';

type SponsorEntry = {
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

function SponsorCell({ sponsor }: { sponsor: SponsorEntry }) {
  return (
    <td className={publicStyles.sponsorCell}>
      <a href={sponsor.href} target="_blank" rel="noopener">
        <Image
          src={sponsor.src}
          alt={sponsor.alt}
          width={sponsor.width}
          height={sponsor.height}
        />
      </a>
    </td>
  );
}

export const Sponsors = () => (
  <table className={publicStyles.sponsorsTable}>
    <tbody>
      {sponsorsGrid.rows.map((row, rowIdx) => (
        <tr key={rowIdx} className={publicStyles.sponsorRow}>
          {row.map((sponsor, colIdx) => (
            <SponsorCell
              key={colIdx}
              sponsor={sponsor}
            />
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
