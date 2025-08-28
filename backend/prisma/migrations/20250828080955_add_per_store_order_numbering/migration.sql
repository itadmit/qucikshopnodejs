/*
  Warnings:

  - A unique constraint covering the columns `[store_id,order_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `order_number` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."orders_order_number_key";

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "order_number",
ADD COLUMN     "order_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."stores" ADD COLUMN     "order_sequence" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "orders_store_id_order_number_key" ON "public"."orders"("store_id", "order_number");
