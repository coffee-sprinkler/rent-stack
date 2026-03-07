-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organization_id_fkey";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "city" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pref_bedrooms" INTEGER,
ADD COLUMN     "pref_location" TEXT,
ADD COLUMN     "pref_max_budget" DECIMAL(10,2),
ADD COLUMN     "pref_min_budget" DECIMAL(10,2),
ADD COLUMN     "pref_property_type" "PropertyType",
ALTER COLUMN "organization_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SavedUnit" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitImage" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedUnit_user_id_unit_id_key" ON "SavedUnit"("user_id", "unit_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedUnit" ADD CONSTRAINT "SavedUnit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedUnit" ADD CONSTRAINT "SavedUnit_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitImage" ADD CONSTRAINT "UnitImage_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
