// app/(dashboard)/dashboard/reports/occupancy/page.tsx

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getOccupancyReport } from '@/app/actions/reports';
import OccupancyReportClient from './OccupancyReportClient';

export default async function OccupancyReportPage() {
  const session = await getSession();
  if (!session || session.role === 'tenant')
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const report = await getOccupancyReport(session.organizationId);

  return <OccupancyReportClient report={report} />;
}
