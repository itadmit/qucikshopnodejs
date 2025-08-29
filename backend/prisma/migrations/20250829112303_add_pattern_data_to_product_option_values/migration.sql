-- AlterEnum
ALTER TYPE "public"."CustomFieldType" ADD VALUE 'RICH_TEXT';

-- AlterTable
ALTER TABLE "public"."product_option_values" ADD COLUMN     "pattern_data" JSONB;
