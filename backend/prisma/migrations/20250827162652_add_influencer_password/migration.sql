-- AlterTable
-- First add the column as nullable
ALTER TABLE "public"."influencers" ADD COLUMN "password" TEXT;

-- Set a default password for existing records (they will need to reset it)
UPDATE "public"."influencers" SET "password" = '$2a$10$XK9jKHgKGz8VzLxqV6hJSuD5MhTPBEwDQoF7pC1KJr2EBthsJ6hnC' WHERE "password" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "public"."influencers" ALTER COLUMN "password" SET NOT NULL;
