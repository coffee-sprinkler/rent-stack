'use client';
// app/(dashboard)/dashboard/reports/maintenance/MaintenanceReportClient.tsx

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
import type { MaintenanceReport, DateRange } from '@/app/actions/reports';

type Props = {
  range: DateRange;
  report: MaintenanceReport;
};

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
};

export default function MaintenanceReportClient(props: Props) {
  const { range, report } = props;
  const router = useRouter();

  function handleRangeChange(value: string) {
    router.push(`/dashboard/reports/maintenance?range=${value}`);
  }

  const statusPieData = [
    { name: 'Open', value: report.open },
    { name: 'In Progress', value: report.inProgress },
    { name: 'Resolved', value: report.resolved },
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
          <h1 className='text-2xl font-bold text-white'>Maintenance Report</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            Request volume and resolution tracking
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
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Total
          </p>
          <p className='text-2xl font-bold text-white'>{report.total}</p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Open
          </p>
          <p className='text-2xl font-bold text-amber-400'>{report.open}</p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            In Progress
          </p>
          <p className='text-2xl font-bold text-indigo-400'>
            {report.inProgress}
          </p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Resolved
          </p>
          <p className='text-2xl font-bold text-green-400'>{report.resolved}</p>
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
                  data={statusPieData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey='value'
                >
                  <Cell fill='#f59e0b' />
                  <Cell fill='#6366f1' />
                  <Cell fill='#22c55e' />
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
            Submitted vs Resolved
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
                  dataKey='submitted'
                  name='Submitted'
                  fill='#6366f1'
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey='resolved'
                  name='Resolved'
                  fill='#22c55e'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* By Priority */}
      {report.byPriority.length > 0 && (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <div className='px-6 py-4 border-b border-zinc-800'>
            <p className='text-xs text-zinc-500 uppercase tracking-widest'>
              By Priority
            </p>
          </div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Priority
                </th>
                <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {report.byPriority.map((row) => (
                <tr
                  key={row.priority}
                  className='border-b border-zinc-800/50 hover:bg-zinc-800/30 transition'
                >
                  <td className='px-6 py-3'>
                    <span
                      className='capitalize font-medium'
                      style={{
                        color: PRIORITY_COLORS[row.priority] ?? '#a1a1aa',
                      }}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className='px-6 py-3 text-right text-zinc-300'>
                    {row.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Table */}
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
                Submitted
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Resolved
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
                <td className='px-6 py-3 text-right text-indigo-400'>
                  {row.submitted}
                </td>
                <td className='px-6 py-3 text-right text-green-400'>
                  {row.resolved}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
