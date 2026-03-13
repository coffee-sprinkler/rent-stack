// app/(dashboard)/dashboard/reports/financial/page.tsx

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getFinancialReport, type DateRange } from '@/app/actions/reports';
import FinancialReportClient from './FinancialReportClient';

type Props = {
  searchParams: Promise<{ range?: string }>;
};

function isValidRange(value: string | undefined): value is DateRange {
  return value === 'month' || value === '3months' || value === 'year';
}

export default async function FinancialReportPage(props: Props) {
  const session = await getSession();
  if (!session || session.role === 'tenant')
    redirect('/dashboard/unauthorized');
  if (!session.organizationId) redirect('/dashboard/unauthorized');

  const { range: rawRange } = await props.searchParams;
  const range: DateRange = isValidRange(rawRange) ? rawRange : 'month';

  const report = await getFinancialReport(session.organizationId, range);

  return <FinancialReportClient range={range} report={report} />;
}
