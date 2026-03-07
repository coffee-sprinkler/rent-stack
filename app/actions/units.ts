'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/db/prisma';
import { verifyToken } from '@/lib/auth';

export async function toggleSaveUnit(unitId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('Unauthorized');

  const payload = verifyToken(token);
  const userId = payload.userId;

  const existing = await prisma.savedUnit.findUnique({
    where: { user_id_unit_id: { user_id: userId, unit_id: unitId } },
  });

  if (existing) {
    await prisma.savedUnit.delete({
      where: { user_id_unit_id: { user_id: userId, unit_id: unitId } },
    });
    return { saved: false };
  } else {
    await prisma.savedUnit.create({
      data: { user_id: userId, unit_id: unitId },
    });
    return { saved: true };
  }
}
