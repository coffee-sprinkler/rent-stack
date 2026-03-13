'use client';
// app/(dashboard)/dashboard/reports/occupancy/OccupancyReportClient.tsx

import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { OccupancyReport } from '@/app/actions/reports';

type Props = {
  report: OccupancyReport;
};

export default function OccupancyReportClient(props: Props) {
  const { report } = props;

  const pieData = [
    { name: 'Occupied', value: report.occupiedUnits },
    { name: 'Vacant', value: report.vacantUnits },
  ];

  const barData = report.byProperty.map((p) => ({
    name: p.property.length > 16 ? p.property.slice(0, 14) + '…' : p.property,
    occupied: p.occupied,
    vacant: p.total - p.occupied,
  }));

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto space-y-8'>
      {/* Header */}
      <div>
        <Link
          href='/dashboard/reports'
          className='text-xs text-zinc-500 hover:text-zinc-300 transition mb-1 block'
        >
          ← Back to Reports
        </Link>
        <h1 className='text-2xl font-bold text-white'>Occupancy Report</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          Current occupancy across all properties
        </p>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Occupancy Rate
          </p>
          <p className='text-2xl font-bold text-indigo-400'>
            {report.occupancyRate}%
          </p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Total Units
          </p>
          <p className='text-2xl font-bold text-white'>{report.totalUnits}</p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Occupied
          </p>
          <p className='text-2xl font-bold text-green-400'>
            {report.occupiedUnits}
          </p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
            Vacant
          </p>
          <p className='text-2xl font-bold text-zinc-400'>
            {report.vacantUnits}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6'>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-5'>
            Overall Split
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
                  <Cell fill='#6366f1' />
                  <Cell fill='#3f3f46' />
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
            By Property
          </p>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={barData} layout='vertical' barGap={2}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#27272a'
                  horizontal={false}
                />
                <XAxis
                  type='number'
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
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
                <Bar
                  dataKey='occupied'
                  name='Occupied'
                  fill='#6366f1'
                  radius={[0, 4, 4, 0]}
                  stackId='a'
                />
                <Bar
                  dataKey='vacant'
                  name='Vacant'
                  fill='#3f3f46'
                  radius={[0, 4, 4, 0]}
                  stackId='a'
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
            Per Property
          </p>
        </div>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-zinc-800'>
              <th className='text-left px-6 py-3 text-xs text-zinc-500 font-medium'>
                Property
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Total
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Occupied
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Vacant
              </th>
              <th className='text-right px-6 py-3 text-xs text-zinc-500 font-medium'>
                Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {report.byProperty.map((row) => {
              const rate =
                row.total === 0
                  ? 0
                  : Math.round((row.occupied / row.total) * 100);
              return (
                <tr
                  key={row.property}
                  className='border-b border-zinc-800/50 hover:bg-zinc-800/30 transition'
                >
                  <td className='px-6 py-3 text-zinc-300'>{row.property}</td>
                  <td className='px-6 py-3 text-right text-zinc-400'>
                    {row.total}
                  </td>
                  <td className='px-6 py-3 text-right text-green-400'>
                    {row.occupied}
                  </td>
                  <td className='px-6 py-3 text-right text-zinc-500'>
                    {row.total - row.occupied}
                  </td>
                  <td className='px-6 py-3 text-right'>
                    <span
                      className={`font-medium ${rate >= 80 ? 'text-green-400' : rate >= 50 ? 'text-amber-400' : 'text-rose-400'}`}
                    >
                      {rate}%
                    </span>
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
