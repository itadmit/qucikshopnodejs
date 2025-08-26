-- CreateEnum
CREATE TYPE "public"."StorePlanType" AS ENUM ('BASIC', 'NO_TRANSACTION');

-- CreateEnum
CREATE TYPE "public"."StoreSubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'INACTIVE', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."StoreRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER');

-- DropIndex
DROP INDEX "public"."stores_user_id_key";

-- AlterTable
ALTER TABLE "public"."stores" ADD COLUMN     "monthly_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "plan_type" "public"."StorePlanType" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "subscription_ends_at" TIMESTAMP(3),
ADD COLUMN     "subscription_status" "public"."StoreSubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "transaction_fee_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.005,
ADD COLUMN     "trial_ends_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."store_users" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "public"."StoreRole" NOT NULL DEFAULT 'STAFF',
    "permissions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_by" INTEGER,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_users_store_id_user_id_key" ON "public"."store_users"("store_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."store_users" ADD CONSTRAINT "store_users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_users" ADD CONSTRAINT "store_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_users" ADD CONSTRAINT "store_users_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
