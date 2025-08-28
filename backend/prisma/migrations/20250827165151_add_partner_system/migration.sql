-- CreateEnum
CREATE TYPE "public"."PartnerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "public"."PartnerStoreStatus" AS ENUM ('DEVELOPMENT', 'TRANSFERRED', 'ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PartnerActivityType" AS ENUM ('LOGIN', 'STORE_CREATED', 'STORE_TRANSFERRED', 'STORE_ACTIVATED', 'COMMISSION_EARNED', 'PAYOUT_REQUESTED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED');

-- CreateTable
CREATE TABLE "public"."partners" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "referral_code" TEXT NOT NULL,
    "tier" "public"."PartnerTier" NOT NULL DEFAULT 'BRONZE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_stores" INTEGER NOT NULL DEFAULT 0,
    "active_stores" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_stores" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "status" "public"."PartnerStoreStatus" NOT NULL DEFAULT 'DEVELOPMENT',
    "referral_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferred_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "transfer_email" TEXT,

    CONSTRAINT "partner_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_commissions" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "partner_store_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "payout_request_id" INTEGER,

    CONSTRAINT "partner_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_payout_requests" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "bank_details" JSONB,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "notes" TEXT,
    "transaction_id" TEXT,

    CONSTRAINT "partner_payout_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_activities" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "type" "public"."PartnerActivityType" NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_email_key" ON "public"."partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partners_referral_code_key" ON "public"."partners"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "partner_stores_partner_id_store_id_key" ON "public"."partner_stores"("partner_id", "store_id");

-- AddForeignKey
ALTER TABLE "public"."partner_stores" ADD CONSTRAINT "partner_stores_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_stores" ADD CONSTRAINT "partner_stores_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_commissions" ADD CONSTRAINT "partner_commissions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_commissions" ADD CONSTRAINT "partner_commissions_partner_store_id_fkey" FOREIGN KEY ("partner_store_id") REFERENCES "public"."partner_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_commissions" ADD CONSTRAINT "partner_commissions_payout_request_id_fkey" FOREIGN KEY ("payout_request_id") REFERENCES "public"."partner_payout_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_payout_requests" ADD CONSTRAINT "partner_payout_requests_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_activities" ADD CONSTRAINT "partner_activities_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
