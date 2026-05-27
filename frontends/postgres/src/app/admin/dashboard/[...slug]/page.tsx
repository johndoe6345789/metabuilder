export const dynamic = 'force-dynamic';

import DashboardContent from './DashboardContent';

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { slug = [] } = await params;
  const section = slug[0] ?? 'tables';
  const table = slug[1] ? decodeURIComponent(slug[1]) : '';
  return <DashboardContent section={section} table={table} />;
}
