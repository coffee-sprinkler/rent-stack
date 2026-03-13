// app/(dashboard)/dashboard/expenses/page.tsx
import { getSession } from '@/lib/session';
import { prisma } from '@/db/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ExpensesPage() {
  const session = await getSession();
  if (!session?.organizationId) redirect('/login');
  console.log('session:', JSON.stringify(session));

  const expenses = await prisma.expense.findMany({
    where: { property: { organization_id: session.organizationId } },
    include: { property: true },
    orderBy: { date: 'desc' },
  });

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  // Group by category
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
    return acc;
  }, {});

  return (
    <div className='px-8 py-8 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold'>Expenses</h1>
          <p className='text-zinc-500 text-sm mt-0.5'>
            {expenses.length} record{expenses.length !== 1 ? 's' : ''} · Total ₱
            {total.toLocaleString()}
          </p>
        </div>
        <Link
          href='/dashboard/expenses/new'
          className='bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition'
        >
          + Log Expense
        </Link>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
          {Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([cat, amount]) => (
              <div
                key={cat}
                className='bg-zinc-900 border border-zinc-800 rounded-xl p-4'
              >
                <p className='text-xs text-zinc-500 uppercase tracking-widest mb-1 capitalize'>
                  {cat}
                </p>
                <p className='text-lg font-bold text-white'>
                  ₱{amount.toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      )}

      {expenses.length === 0 ? (
        <div className='bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-16 text-center'>
          <p className='text-4xl mb-4'>📊</p>
          <h3 className='text-lg font-semibold mb-2'>No expenses yet</h3>
          <p className='text-zinc-500 text-sm mb-6'>
            Track repairs, utilities, and other costs.
          </p>
          <Link
            href='/dashboard/expenses/new'
            className='inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition'
          >
            + Log your first expense
          </Link>
        </div>
      ) : (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-zinc-800'>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Description
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden sm:table-cell'>
                  Property
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Category
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell'>
                  Date
                </th>
                <th className='text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium'>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr
                  key={e.id}
                  className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition'
                >
                  <td className='px-6 py-4'>
                    <p className='text-white'>{e.description ?? '—'}</p>
                  </td>
                  <td className='px-6 py-4 hidden sm:table-cell'>
                    <Link
                      href={`/dashboard/properties/${e.property_id}`}
                      className='text-zinc-400 hover:text-white transition'
                    >
                      {e.property.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4'>
                    <span className='text-xs px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 capitalize'>
                      {e.category}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-zinc-400 hidden lg:table-cell'>
                    {new Date(e.date).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className='px-6 py-4 text-white font-medium'>
                    ₱{Number(e.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
