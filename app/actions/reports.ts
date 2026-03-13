'use server';
// app/actions/reports.ts

import { prisma } from '@/db/prisma';

export type DateRange = 'month' | '3months' | 'year';

export type FinancialReport = {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyBreakdown: { month: string; income: number; expenses: number }[];
};

export type OccupancyReport = {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  byProperty: { property: string; total: number; occupied: number }[];
};

export type PaymentsReport = {
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  paid: number;
  pending: number;
  late: number;
  monthlyBreakdown: {
    month: string;
    paid: number;
    pending: number;
    late: number;
  }[];
};

export type MaintenanceReport = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  byPriority: { priority: string; count: number }[];
  monthlyBreakdown: { month: string; submitted: number; resolved: number }[];
};

function buildDateFilter(range: DateRange): Date {
  const now = new Date();
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (range === '3months')
    return new Date(now.getFullYear(), now.getMonth() - 3, 1);
  return new Date(now.getFullYear(), 0, 1);
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
}

function buildMonthBuckets(
  range: DateRange,
): { label: string; start: Date; end: Date }[] {
  const now = new Date();
  const buckets: { label: string; start: Date; end: Date }[] = [];
  const monthCount = range === 'month' ? 1 : range === '3months' ? 3 : 12;

  for (let i = monthCount - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59,
    );
    buckets.push({ label: formatMonthLabel(start), start, end });
  }

  return buckets;
}

export async function getFinancialReport(
  organizationId: string,
  range: DateRange,
): Promise<FinancialReport> {
  const since = buildDateFilter(range);
  const buckets = buildMonthBuckets(range);

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: {
        status: 'paid',
        paid_date: { gte: since },
        lease: { unit: { property: { organization_id: organizationId } } },
      },
      select: { amount: true, paid_date: true },
    }),
    prisma.expense.findMany({
      where: {
        date: { gte: since },
        property: { organization_id: organizationId },
      },
      select: { amount: true, date: true },
    }),
  ]);

  const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const monthlyBreakdown = buckets.map((bucket) => {
    const income = payments
      .filter(
        (p) =>
          p.paid_date &&
          p.paid_date >= bucket.start &&
          p.paid_date <= bucket.end,
      )
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const expensesTotal = expenses
      .filter((e) => e.date >= bucket.start && e.date <= bucket.end)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return { month: bucket.label, income, expenses: expensesTotal };
  });

  return {
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    monthlyBreakdown,
  };
}

export async function getOccupancyReport(
  organizationId: string,
): Promise<OccupancyReport> {
  const properties = await prisma.property.findMany({
    where: { organization_id: organizationId },
    select: {
      name: true,
      units: { select: { status: true } },
    },
  });

  const byProperty = properties.map((property) => {
    const total = property.units.length;
    const occupied = property.units.filter(
      (u) => u.status === 'occupied',
    ).length;
    return { property: property.name, total, occupied };
  });

  const totalUnits = byProperty.reduce((sum, p) => sum + p.total, 0);
  const occupiedUnits = byProperty.reduce((sum, p) => sum + p.occupied, 0);
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate =
    totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100);

  return { totalUnits, occupiedUnits, vacantUnits, occupancyRate, byProperty };
}

export async function getPaymentsReport(
  organizationId: string,
  range: DateRange,
): Promise<PaymentsReport> {
  const since = buildDateFilter(range);
  const buckets = buildMonthBuckets(range);

  const payments = await prisma.payment.findMany({
    where: {
      due_date: { gte: since },
      lease: { unit: { property: { organization_id: organizationId } } },
    },
    select: { amount: true, status: true, due_date: true, paid_date: true },
  });

  const paid = payments.filter((p) => p.status === 'paid').length;
  const pending = payments.filter((p) => p.status === 'pending').length;
  const late = payments.filter((p) => p.status === 'late').length;

  const totalExpected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const collectionRate =
    totalExpected === 0
      ? 0
      : Math.round((totalCollected / totalExpected) * 100);

  const monthlyBreakdown = buckets.map((bucket) => {
    const inBucket = payments.filter(
      (p) => p.due_date >= bucket.start && p.due_date <= bucket.end,
    );
    return {
      month: bucket.label,
      paid: inBucket.filter((p) => p.status === 'paid').length,
      pending: inBucket.filter((p) => p.status === 'pending').length,
      late: inBucket.filter((p) => p.status === 'late').length,
    };
  });

  return {
    totalExpected,
    totalCollected,
    collectionRate,
    paid,
    pending,
    late,
    monthlyBreakdown,
  };
}

export async function getMaintenanceReport(
  organizationId: string,
  range: DateRange,
): Promise<MaintenanceReport> {
  const since = buildDateFilter(range);
  const buckets = buildMonthBuckets(range);

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      created_at: { gte: since },
      unit: { property: { organization_id: organizationId } },
    },
    select: { status: true, priority: true, created_at: true },
  });

  const open = requests.filter((r) => r.status === 'open').length;
  const inProgress = requests.filter((r) => r.status === 'in_progress').length;
  const resolved = requests.filter((r) => r.status === 'resolved').length;

  const priorityCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.priority] = (acc[r.priority] ?? 0) + 1;
    return acc;
  }, {});
  const byPriority = Object.entries(priorityCounts).map(
    ([priority, count]) => ({ priority, count }),
  );

  // No updated_at on MaintenanceRequest — approximate resolved-in-bucket
  // by counting requests created in that bucket that are currently resolved
  const monthlyBreakdown = buckets.map((bucket) => {
    const inBucket = requests.filter(
      (r) => r.created_at >= bucket.start && r.created_at <= bucket.end,
    );
    return {
      month: bucket.label,
      submitted: inBucket.length,
      resolved: inBucket.filter((r) => r.status === 'resolved').length,
    };
  });

  return {
    total: requests.length,
    open,
    inProgress,
    resolved,
    byPriority,
    monthlyBreakdown,
  };
}
