// app/(dashboard)/dashboard/reports/page.tsx

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import {
  getFinancialReport,
  getOccupancyReport,
  getPaymentsReport,
  getMaintenanceReport,
  type DateRange,
} from '@/app/actions/reports';
import ReportsOverviewClient from './ReportsOverviewClient';

type Props = {
  searchParams: Promise<{ range?: string }>;
};

function isValidRange(value: string | undefined): value is DateRange {
  return value === 'month' || value === '3months' || value === 'year';
}

export default async function ReportsPage(props: Props) {
  const session = await getSession();
  if (!session || session.role === 'tenant')
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const { range: rawRange } = await props.searchParams;
  const range: DateRange = isValidRange(rawRange) ? rawRange : 'month';
  const orgId = session.organizationId;

  const [financial, occupancy, payments, maintenance] = await Promise.all([
    getFinancialReport(orgId, range),
    getOccupancyReport(orgId),
    getPaymentsReport(orgId, range),
    getMaintenanceReport(orgId, range),
  ]);

  return (
    <ReportsOverviewClient
      range={range}
      financial={financial}
      occupancy={occupancy}
      payments={payments}
      maintenance={maintenance}
    />
  );
}
