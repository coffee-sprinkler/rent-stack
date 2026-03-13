'use client';
// app/(dashboard)/dashboard/reports/ReportsOverviewClient.tsx

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type {
  FinancialReport,
  OccupancyReport,
  PaymentsReport,
  MaintenanceReport,
  DateRange,
} from '@/app/actions/reports';

type TabId =
  | 'overview'
  | 'financial'
  | 'occupancy'
  | 'payments'
  | 'maintenance';

type Props = {
  range: DateRange;
  financial: FinancialReport;
  occupancy: OccupancyReport;
  payments: PaymentsReport;
  maintenance: MaintenanceReport;
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'financial', label: 'Financial' },
  { id: 'occupancy', label: 'Occupancy' },
  { id: 'payments', label: 'Payments' },
  { id: 'maintenance', label: 'Maintenance' },
];

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
];

const COLORS = {
  income: '#6366f1',
  expenses: '#f43f5e',
  paid: '#22c55e',
  pending: '#f59e0b',
  late: '#ef4444',
  occupied: '#6366f1',
  vacant: '#3f3f46',
  inProgress: '#6366f1',
  resolved: '#22c55e',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: '#a1a1aa' },
};

const AXIS_PROPS = {
  tick: { fill: '#71717a', fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function RangeSelect(props: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  const { value, onChange } = props;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DateRange)}
      className='bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition'
    >
      {RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function StatCard(props: {
  label: string;
  value: string;
  sub?: string;
  href: string;
  accent?: string;
}) {
  const { label, value, sub, href, accent = 'text-white' } = props;
  return (
    <Link
      href={href}
      className='bg-zinc-800/60 border border-zinc-700 rounded-xl p-5 hover:border-zinc-500 transition group block'
    >
      <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1'>
        {label}
      </p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className='text-xs text-zinc-500 mt-1'>{sub}</p>}
      <p className='text-xs text-indigo-400 mt-3 opacity-0 group-hover:opacity-100 transition'>
        View full report →
      </p>
    </Link>
  );
}

// ─── Tab content panels ───────────────────────────────────────────────────────

function OverviewTab(props: {
  financial: FinancialReport;
  occupancy: OccupancyReport;
  payments: PaymentsReport;
  maintenance: MaintenanceReport;
}) {
  const { financial, occupancy, payments, maintenance } = props;
  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <StatCard
          label='Net Income'
          value={`₱${financial.netIncome.toLocaleString()}`}
          href='/dashboard/reports/financial'
          accent={financial.netIncome >= 0 ? 'text-green-400' : 'text-rose-400'}
        />
        <StatCard
          label='Occupancy Rate'
          value={`${occupancy.occupancyRate}%`}
          href='/dashboard/reports/occupancy'
          accent='text-indigo-400'
        />
        <StatCard
          label='Collection Rate'
          value={`${payments.collectionRate}%`}
          href='/dashboard/reports/payments'
          accent='text-indigo-400'
        />
        <StatCard
          label='Open Requests'
          value={String(maintenance.open)}
          href='/dashboard/reports/maintenance'
          accent='text-amber-400'
        />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        <div>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-3'>
            Income vs Expenses
          </p>
          <div className='h-52'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={financial.monthlyBreakdown} barGap={4}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#27272a'
                  vertical={false}
                />
                <XAxis dataKey='month' {...AXIS_PROPS} />
                <YAxis
                  {...AXIS_PROPS}
                  tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(value) => [
                    `₱${Number(value).toLocaleString()}`,
                    undefined,
                  ]}
                />
                <Bar
                  dataKey='income'
                  name='Income'
                  fill={COLORS.income}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey='expenses'
                  name='Expenses'
                  fill={COLORS.expenses}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <p className='text-xs text-zinc-500 uppercase tracking-widest mb-3'>
            Occupancy Split
          </p>
          <div className='h-52'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Occupied', value: occupancy.occupiedUnits },
                    { name: 'Vacant', value: occupancy.vacantUnits },
                  ]}
                  cx='50%'
                  cy='50%'
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey='value'
                >
                  <Cell fill={COLORS.occupied} />
                  <Cell fill={COLORS.vacant} />
                </Pie>
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(value) => [Number(value), undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialTab(props: {
  financial: FinancialReport;
  range: DateRange;
  onRangeChange: (v: DateRange) => void;
}) {
  const { financial, range, onRangeChange } = props;
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <p className='text-sm text-zinc-400'>Income vs expenses breakdown</p>
        <RangeSelect value={range} onChange={onRangeChange} />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          label='Total Income'
          value={`₱${financial.totalIncome.toLocaleString()}`}
          href='/dashboard/reports/financial'
          accent='text-indigo-400'
        />
        <StatCard
          label='Total Expenses'
          value={`₱${financial.totalExpenses.toLocaleString()}`}
          href='/dashboard/reports/financial'
          accent='text-rose-400'
        />
        <StatCard
          label='Net Income'
          value={`₱${financial.netIncome.toLocaleString()}`}
          href='/dashboard/reports/financial'
          accent={financial.netIncome >= 0 ? 'text-green-400' : 'text-rose-400'}
        />
      </div>
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={financial.monthlyBreakdown} barGap={4}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#27272a'
              vertical={false}
            />
            <XAxis dataKey='month' {...AXIS_PROPS} />
            <YAxis
              {...AXIS_PROPS}
              tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value) => [
                `₱${Number(value).toLocaleString()}`,
                undefined,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
            <Bar
              dataKey='income'
              name='Income'
              fill={COLORS.income}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='expenses'
              name='Expenses'
              fill={COLORS.expenses}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OccupancyTab(props: { occupancy: OccupancyReport }) {
  const { occupancy } = props;
  return (
    <div className='space-y-6'>
      <p className='text-sm text-zinc-400'>
        Current occupancy across all properties — no date filter needed
      </p>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <StatCard
          label='Occupancy Rate'
          value={`${occupancy.occupancyRate}%`}
          href='/dashboard/reports/occupancy'
          accent='text-indigo-400'
        />
        <StatCard
          label='Total Units'
          value={String(occupancy.totalUnits)}
          href='/dashboard/reports/occupancy'
        />
        <StatCard
          label='Occupied'
          value={String(occupancy.occupiedUnits)}
          href='/dashboard/reports/occupancy'
          accent='text-green-400'
        />
        <StatCard
          label='Vacant'
          value={String(occupancy.vacantUnits)}
          href='/dashboard/reports/occupancy'
          accent='text-zinc-400'
        />
      </div>
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={[
                { name: 'Occupied', value: occupancy.occupiedUnits },
                { name: 'Vacant', value: occupancy.vacantUnits },
              ]}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey='value'
            >
              <Cell fill={COLORS.occupied} />
              <Cell fill={COLORS.vacant} />
            </Pie>
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value) => [Number(value), undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PaymentsTab(props: {
  payments: PaymentsReport;
  range: DateRange;
  onRangeChange: (v: DateRange) => void;
}) {
  const { payments, range, onRangeChange } = props;
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <p className='text-sm text-zinc-400'>
          Collection rate and payment status
        </p>
        <RangeSelect value={range} onChange={onRangeChange} />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <StatCard
          label='Collection Rate'
          value={`${payments.collectionRate}%`}
          href='/dashboard/reports/payments'
          accent='text-indigo-400'
        />
        <StatCard
          label='Paid'
          value={String(payments.paid)}
          href='/dashboard/reports/payments'
          accent='text-green-400'
        />
        <StatCard
          label='Pending'
          value={String(payments.pending)}
          href='/dashboard/reports/payments'
          accent='text-amber-400'
        />
        <StatCard
          label='Late'
          value={String(payments.late)}
          href='/dashboard/reports/payments'
          accent='text-rose-400'
        />
      </div>
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={payments.monthlyBreakdown} barGap={4}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#27272a'
              vertical={false}
            />
            <XAxis dataKey='month' {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
            <Bar
              dataKey='paid'
              name='Paid'
              fill={COLORS.paid}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='pending'
              name='Pending'
              fill={COLORS.pending}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='late'
              name='Late'
              fill={COLORS.late}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MaintenanceTab(props: {
  maintenance: MaintenanceReport;
  range: DateRange;
  onRangeChange: (v: DateRange) => void;
}) {
  const { maintenance, range, onRangeChange } = props;
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <p className='text-sm text-zinc-400'>
          Request volume and resolution tracking
        </p>
        <RangeSelect value={range} onChange={onRangeChange} />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <StatCard
          label='Total'
          value={String(maintenance.total)}
          href='/dashboard/reports/maintenance'
        />
        <StatCard
          label='Open'
          value={String(maintenance.open)}
          href='/dashboard/reports/maintenance'
          accent='text-amber-400'
        />
        <StatCard
          label='In Progress'
          value={String(maintenance.inProgress)}
          href='/dashboard/reports/maintenance'
          accent='text-indigo-400'
        />
        <StatCard
          label='Resolved'
          value={String(maintenance.resolved)}
          href='/dashboard/reports/maintenance'
          accent='text-green-400'
        />
      </div>
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={maintenance.monthlyBreakdown} barGap={4}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#27272a'
              vertical={false}
            />
            <XAxis dataKey='month' {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
            <Bar
              dataKey='submitted'
              name='Submitted'
              fill={COLORS.inProgress}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='resolved'
              name='Resolved'
              fill={COLORS.resolved}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReportsOverviewClient(props: Props) {
  const {
    range: initialRange,
    financial,
    occupancy,
    payments,
    maintenance,
  } = props;

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Each range-aware tab gets its own independent state seeded from the server's initial value
  const [financialRange, setFinancialRange] = useState<DateRange>(initialRange);
  const [paymentsRange, setPaymentsRange] = useState<DateRange>(initialRange);
  const [maintenanceRange, setMaintenanceRange] =
    useState<DateRange>(initialRange);

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      {/* Page header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-white'>Reports</h1>
        <p className='text-zinc-500 text-sm mt-0.5'>
          Overview of your organization&apos;s performance
        </p>
      </div>

      {/* Mobile: dropdown */}
      <div className='sm:hidden mb-4'>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabId)}
          className='w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition'
        >
          {TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: folder tab row */}
      <div className='hidden sm:flex items-end gap-1'>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-5 py-2.5 text-sm font-medium rounded-t-xl border border-b-0 transition-all whitespace-nowrap
                ${
                  isActive
                    ? 'bg-zinc-900 border-zinc-700 text-white relative z-10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content panel — flush bottom border of active tab */}
      <div className='bg-zinc-900 border border-zinc-700 rounded-b-2xl rounded-tr-2xl p-6 -mt-px min-h-[420px]'>
        {activeTab === 'overview' && (
          <OverviewTab
            financial={financial}
            occupancy={occupancy}
            payments={payments}
            maintenance={maintenance}
          />
        )}
        {activeTab === 'financial' && (
          <FinancialTab
            financial={financial}
            range={financialRange}
            onRangeChange={setFinancialRange}
          />
        )}
        {activeTab === 'occupancy' && <OccupancyTab occupancy={occupancy} />}
        {activeTab === 'payments' && (
          <PaymentsTab
            payments={payments}
            range={paymentsRange}
            onRangeChange={setPaymentsRange}
          />
        )}
        {activeTab === 'maintenance' && (
          <MaintenanceTab
            maintenance={maintenance}
            range={maintenanceRange}
            onRangeChange={setMaintenanceRange}
          />
        )}
      </div>
    </div>
  );
}
