import Image from 'next/image';
import sponsorsGrid from '@/config/sponsorsGrid.json';

type SponsorEntry = {
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

function SponsorCell({ sponsor }: { sponsor: SponsorEntry }) {
  return (
    <td className="border-2 border-gray-300 p-3">
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
  <table className="border-collapse">
    <tbody>
      {sponsorsGrid.rows.map((row, rowIdx) => (
        <tr key={rowIdx} className="h-56">
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
