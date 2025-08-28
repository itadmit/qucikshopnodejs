-- AlterTable
ALTER TABLE "public"."stores" ADD COLUMN     "template_customizations" JSONB,
ADD COLUMN     "template_id" TEXT;

-- CreateTable
CREATE TABLE "public"."templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "files" JSONB NOT NULL,
    "config" JSONB NOT NULL,
    "author" TEXT,
    "thumbnail" TEXT,
    "tags" TEXT[],
    "category" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "templates_name_key" ON "public"."templates"("name");

-- AddForeignKey
ALTER TABLE "public"."stores" ADD CONSTRAINT "stores_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
