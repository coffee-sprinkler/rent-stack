import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Organization
  const org = await prisma.organization.create({
    data: { name: 'Demo Properties' },
  });

  // Landlord (manager)
  await prisma.user.create({
    data: {
      name: 'Juan dela Cruz',
      email: 'landlord@demo.com',
      password: await bcrypt.hash('password123', 12),
      role: 'manager',
      organization_id: org.id,
    },
  });

  // Admin
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: await bcrypt.hash('password123', 12),
      role: 'admin',
      organization_id: org.id,
    },
  });

  // Tenant users (no org)
  const tenantUsers = [
    { name: 'Maria Santos', email: 'maria@demo.com' },
    { name: 'Pedro Reyes', email: 'pedro@demo.com' },
    { name: 'Ana Garcia', email: 'ana@demo.com' },
  ];

  for (const t of tenantUsers) {
    await prisma.user.create({
      data: {
        ...t,
        password: await bcrypt.hash('password123', 12),
        role: 'tenant',
      },
    });
  }

  // Property
  const property = await prisma.property.create({
    data: {
      name: 'Sunset Residences',
      province: 'Metro Manila',
      city: 'Manila',
      barangay: 'Ermita',
      street: '123 Sunset Blvd',
      property_type: 'apartment',
      organization_id: org.id,
    },
  });

  // Units
  const units = [
    {
      unit_number: '101',
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      rent_amount: 12000,
    },
    {
      unit_number: '102',
      floor: 1,
      bedrooms: 2,
      bathrooms: 1,
      rent_amount: 18000,
    },
    {
      unit_number: '201',
      floor: 2,
      bedrooms: 2,
      bathrooms: 2,
      rent_amount: 22000,
    },
    {
      unit_number: '202',
      floor: 2,
      bedrooms: 3,
      bathrooms: 2,
      rent_amount: 28000,
    },
    {
      unit_number: '301',
      floor: 3,
      bedrooms: 1,
      bathrooms: 1,
      rent_amount: 13000,
    },
    {
      unit_number: '302',
      floor: 3,
      bedrooms: 3,
      bathrooms: 2,
      rent_amount: 30000,
    },
  ];

  for (const unit of units) {
    await prisma.unit.create({
      data: { ...unit, property_id: property.id, status: 'available' },
    });
  }

  console.log('✅ Seed complete');
  console.log('   landlord@demo.com / password123  (manager)');
  console.log('   admin@demo.com    / password123  (admin)');
  console.log('   maria@demo.com    / password123  (tenant)');
  console.log('   pedro@demo.com    / password123  (tenant)');
  console.log('   ana@demo.com      / password123  (tenant)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
