'use client';
// app/(dashboard)/dashboard/reports/payments/PaymentsReportClient.tsx

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { PaymentsReport, DateRange } from '@/app/actions/reports';

type Props = {
  range: DateRange;
  report: PaymentsReport;
};

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
];

export default function PaymentsReportClient(props: Props) {
  const { range, report } = props;
  const router = useRouter();

  function handleRangeChange(value: string) {
    router.push(`/dashboard/reports/payments?range=${value}`);
  }

  const pieData = [
    { name: 'Paid', value: report.paid },
    { name: 'Pending', value: report.pending },
    { name: 'Late', value: report.late },
  ];

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto space-y-8'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4 flex-wrap'>
        <div>
          <Link
            href='/dashboard/reports'
            className='text-xs text-zinc-500 hover:text-zinc-300 transition mb-1 block'
          >
            ← Back to Reports
          </Link>
          <h1 className='text-2xl font-bold text-white'>Payments Report</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            Collection rate and payment status breakdown
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => handleRangeChange(e.target.value)}
          className='bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition'
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5 col-span-2 sm:col-span-1'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Collection Rate
          </p>
          <p className='text-2xl font-bold text-indigo-400'>
            {report.collectionRate}%
          </p>
          <p className='text-xs text-zinc-600 mt-1'>
            ₱{report.totalCollected.toLocaleString()} of ₱
            {report.totalExpected.toLocaleString()}
          </p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Paid
          </p>
          <p className='text-2xl font-bold text-green-400'>{report.paid}</p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Pending
          </p>
          <p className='text-2xl font-bold text-amber-400'>{report.pending}</p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Late
          </p>
          <p className='text-2xl font-bold text-rose-400'>{report.late}</p>
        </div>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-5'>
            Status Split
          </p>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={pieData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey='value'
                >
                  <Cell fill='#22c55e' />
                  <Cell fill='#f59e0b' />
                  <Cell fill='#ef4444' />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [Number(value), undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-5'>
            Monthly Breakdown
          </p>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={report.monthlyBreakdown} barGap={4}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#27272a'
                  vertical={false}
                />
                <XAxis
                  dataKey='month'
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                <Bar
                  dataKey='paid'
                  name='Paid'
                  fill='#22c55e'
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey='pending'
                  name='Pending'
                  fill='#f59e0b'
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey='late'
                  name='Late'
                  fill='#ef4444'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
        <div className='px-6 py-4 border-b border-zinc-800'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest'>
            Month by Month
          </p>
        </div>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-zinc-800'>
              <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                Month
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Paid
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Pending
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Late
              </th>
            </tr>
          </thead>
          <tbody>
            {report.monthlyBreakdown.map((row) => (
              <tr
                key={row.month}
                className='border-b border-zinc-800/50 hover:bg-zinc-800/30 transition'
              >
                <td className='px-6 py-3 text-zinc-300'>{row.month}</td>
                <td className='px-6 py-3 text-right text-green-400'>
                  {row.paid}
                </td>
                <td className='px-6 py-3 text-right text-amber-400'>
                  {row.pending}
                </td>
                <td className='px-6 py-3 text-right text-rose-400'>
                  {row.late}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
