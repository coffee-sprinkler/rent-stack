/*
  Warnings:

  - You are about to drop the column `address` on the `Property` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_organization_id_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "address",
ADD COLUMN     "barangay" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "street" TEXT,
ALTER COLUMN "organization_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LeaseApplication" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaseApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeaseApplication" ADD CONSTRAINT "LeaseApplication_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaseApplication" ADD CONSTRAINT "LeaseApplication_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
