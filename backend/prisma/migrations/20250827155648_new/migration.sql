/*
  Warnings:

  - The values [PERCENTAGE,FIXED_AMOUNT,FREE_SHIPPING] on the enum `CouponType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `applies_to` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `can_combine_with_coupons` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `category_ids` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `minimum_quantity` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `product_ids` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `automatic_discounts` table. All the data in the column will be lost.
  - You are about to drop the column `applies_to` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `can_combine_with_other_coupons` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `category_ids` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `product_ids` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `usage_limit_per_customer` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `used_count` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `coupons` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `coupons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discountType` to the `automatic_discounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount_value` to the `automatic_discounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountType` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount_value` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'TIERED', 'BUNDLE');

-- CreateEnum
CREATE TYPE "public"."DiscountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'USED_UP');

-- CreateEnum
CREATE TYPE "public"."InfluencerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."CouponType_new" AS ENUM ('SINGLE_USE', 'MULTIPLE_USE', 'UNLIMITED');
ALTER TABLE "public"."coupons" ALTER COLUMN "type" TYPE "public"."CouponType_new" USING ("type"::text::"public"."CouponType_new");
ALTER TYPE "public"."CouponType" RENAME TO "CouponType_old";
ALTER TYPE "public"."CouponType_new" RENAME TO "CouponType";
DROP TYPE "public"."CouponType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."automatic_discounts" DROP COLUMN "applies_to",
DROP COLUMN "can_combine_with_coupons",
DROP COLUMN "category_ids",
DROP COLUMN "is_active",
DROP COLUMN "minimum_quantity",
DROP COLUMN "product_ids",
DROP COLUMN "type",
DROP COLUMN "value",
ADD COLUMN     "applicable_categories" JSONB,
ADD COLUMN     "applicable_products" JSONB,
ADD COLUMN     "customer_segments" JSONB,
ADD COLUMN     "discountType" "public"."DiscountType" NOT NULL,
ADD COLUMN     "discount_value" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "excluded_categories" JSONB,
ADD COLUMN     "excluded_products" JSONB,
ADD COLUMN     "influencer_id" INTEGER,
ADD COLUMN     "maximum_discount" DOUBLE PRECISION,
ADD COLUMN     "stackable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "public"."DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tiered_rules" JSONB,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."coupons" DROP COLUMN "applies_to",
DROP COLUMN "can_combine_with_other_coupons",
DROP COLUMN "category_ids",
DROP COLUMN "is_active",
DROP COLUMN "product_ids",
DROP COLUMN "usage_limit_per_customer",
DROP COLUMN "used_count",
DROP COLUMN "value",
ADD COLUMN     "applicable_categories" JSONB,
ADD COLUMN     "applicable_products" JSONB,
ADD COLUMN     "customer_limit" INTEGER,
ADD COLUMN     "customer_segments" JSONB,
ADD COLUMN     "discountType" "public"."DiscountType" NOT NULL,
ADD COLUMN     "discount_value" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "excluded_categories" JSONB,
ADD COLUMN     "excluded_products" JSONB,
ADD COLUMN     "influencer_id" INTEGER,
ADD COLUMN     "status" "public"."DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "type" SET DEFAULT 'MULTIPLE_USE';

-- CreateTable
CREATE TABLE "public"."influencers" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "code" TEXT NOT NULL,
    "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "status" "public"."InfluencerStatus" NOT NULL DEFAULT 'PENDING',
    "total_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupon_usages" (
    "id" SERIAL NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "customer_id" INTEGER,
    "session_id" TEXT,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "order_total" DOUBLE PRECISION NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."influencer_stats" (
    "id" SERIAL NOT NULL,
    "influencer_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coupon_uses" INTEGER NOT NULL DEFAULT 0,
    "new_customers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "influencer_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "influencers_code_key" ON "public"."influencers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_store_id_email_key" ON "public"."influencers"("store_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_store_id_code_key" ON "public"."influencers"("store_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "influencer_stats_influencer_id_date_key" ON "public"."influencer_stats"("influencer_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "public"."coupons"("code");

-- AddForeignKey
ALTER TABLE "public"."influencers" ADD CONSTRAINT "influencers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."automatic_discounts" ADD CONSTRAINT "automatic_discounts_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."influencer_stats" ADD CONSTRAINT "influencer_stats_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
