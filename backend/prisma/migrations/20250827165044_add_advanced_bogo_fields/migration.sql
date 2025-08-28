-- AlterTable
ALTER TABLE "public"."automatic_discounts" ADD COLUMN     "buy_categories" JSONB,
ADD COLUMN     "buy_products" JSONB,
ADD COLUMN     "get_categories" JSONB,
ADD COLUMN     "get_discount_type" TEXT,
ADD COLUMN     "get_discount_value" DOUBLE PRECISION,
ADD COLUMN     "get_products" JSONB;
