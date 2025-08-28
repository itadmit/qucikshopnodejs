-- CreateEnum
CREATE TYPE "public"."GlobalSettingsType" AS ENUM ('HEADER', 'FOOTER', 'THEME', 'GENERAL');

-- CreateTable
CREATE TABLE "public"."global_settings" (
    "id" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "type" "public"."GlobalSettingsType" NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_store_id_type_key" ON "public"."global_settings"("store_id", "type");

-- AddForeignKey
ALTER TABLE "public"."global_settings" ADD CONSTRAINT "global_settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
