'use client';
// app/(dashboard)/dashboard/reports/financial/FinancialReportClient.tsx

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
} from 'recharts';
import type { FinancialReport, DateRange } from '@/app/actions/reports';

type Props = {
  range: DateRange;
  report: FinancialReport;
};

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
];

export default function FinancialReportClient(props: Props) {
  const { range, report } = props;
  const router = useRouter();

  function handleRangeChange(value: string) {
    router.push(`/dashboard/reports/financial?range=${value}`);
  }

  const isProfit = report.netIncome >= 0;

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
          <h1 className='text-2xl font-bold text-white'>Financial Report</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            Income vs expenses breakdown
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
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Total Income
          </p>
          <p className='text-2xl font-bold text-indigo-400'>
            ₱{report.totalIncome.toLocaleString()}
          </p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Total Expenses
          </p>
          <p className='text-2xl font-bold text-rose-400'>
            ₱{report.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Net Income
          </p>
          <p
            className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-rose-400'}`}
          >
            {isProfit ? '+' : ''}₱{report.netIncome.toLocaleString()}
          </p>
          <p className='text-xs text-zinc-600 mt-1'>
            {isProfit ? 'Profitable period' : 'Net loss'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
        <p className='text-xs text-zinc-500 uppercase tracking-widest mb-5'>
          Monthly Breakdown
        </p>
        <div className='h-72'>
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
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(value) => [
                  `₱${Number(value).toLocaleString()}`,
                  undefined,
                ]}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  color: '#a1a1aa',
                  paddingTop: 16,
                }}
              />
              <Bar
                dataKey='income'
                name='Income'
                fill='#6366f1'
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='expenses'
                name='Expenses'
                fill='#f43f5e'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
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
                Income
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Expenses
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Net
              </th>
            </tr>
          </thead>
          <tbody>
            {report.monthlyBreakdown.map((row) => {
              const net = row.income - row.expenses;
              return (
                <tr
                  key={row.month}
                  className='border-b border-zinc-800/50 hover:bg-zinc-800/30 transition'
                >
                  <td className='px-6 py-3 text-zinc-300'>{row.month}</td>
                  <td className='px-6 py-3 text-right text-indigo-400'>
                    ₱{row.income.toLocaleString()}
                  </td>
                  <td className='px-6 py-3 text-right text-rose-400'>
                    ₱{row.expenses.toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-3 text-right font-medium ${net >= 0 ? 'text-green-400' : 'text-rose-400'}`}
                  >
                    {net >= 0 ? '+' : ''}₱{net.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
