-- CreateTable
CREATE TABLE "public"."custom_pages" (
    "id" TEXT NOT NULL,
    "store_id" INTEGER NOT NULL,
    "page_type" "public"."PageType" NOT NULL,
    "structure" JSONB NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_pages_store_id_page_type_key" ON "public"."custom_pages"("store_id", "page_type");

-- AddForeignKey
ALTER TABLE "public"."custom_pages" ADD CONSTRAINT "custom_pages_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
