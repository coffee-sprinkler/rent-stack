// app/(dashboard)/dashboard/reports/maintenance/page.tsx

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getMaintenanceReport, type DateRange } from '@/app/actions/reports';
import MaintenanceReportClient from './MaintenanceReportClient';

type Props = {
  searchParams: Promise<{ range?: string }>;
};

function isValidRange(value: string | undefined): value is DateRange {
  return value === 'month' || value === '3months' || value === 'year';
}

export default async function MaintenanceReportPage(props: Props) {
  const session = await getSession();
  if (!session || session.role === 'tenant')
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const { range: rawRange } = await props.searchParams;
  const range: DateRange = isValidRange(rawRange) ? rawRange : 'month';

  const report = await getMaintenanceReport(session.organizationId, range);

  return <MaintenanceReportClient range={range} report={report} />;
}
