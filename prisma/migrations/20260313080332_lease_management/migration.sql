/*
  Warnings:

  - The values [ended] on the enum `LeaseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeaseStatus_new" AS ENUM ('active', 'expired', 'terminated');
ALTER TABLE "public"."Lease" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lease" ALTER COLUMN "status" TYPE "LeaseStatus_new" USING ("status"::text::"LeaseStatus_new");
ALTER TYPE "LeaseStatus" RENAME TO "LeaseStatus_old";
ALTER TYPE "LeaseStatus_new" RENAME TO "LeaseStatus";
DROP TYPE "public"."LeaseStatus_old";
ALTER TABLE "Lease" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "document_url" TEXT,
ADD COLUMN     "renewed_from_id" TEXT,
ADD COLUMN     "terminated_at" TIMESTAMP(3),
ADD COLUMN     "termination_reason" TEXT;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_renewed_from_id_fkey" FOREIGN KEY ("renewed_from_id") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;
