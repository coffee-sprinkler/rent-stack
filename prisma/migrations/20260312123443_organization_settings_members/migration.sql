-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('admin', 'manager');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "role" "MemberRole" NOT NULL DEFAULT 'manager',
    "invite_status" "InviteStatus" NOT NULL DEFAULT 'pending',
    "invite_token" TEXT,
    "invited_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_invite_token_key" ON "OrganizationMember"("invite_token");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organization_id_invited_email_key" ON "OrganizationMember"("organization_id", "invited_email");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
