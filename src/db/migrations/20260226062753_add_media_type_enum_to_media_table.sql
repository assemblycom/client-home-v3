CREATE TYPE "public"."media_type" AS ENUM('banner', 'media');
ALTER TABLE "media" ADD COLUMN "media_type" "media_type" DEFAULT 'media' NOT NULL;