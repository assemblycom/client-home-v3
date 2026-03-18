CREATE TYPE "public"."custom_field_entity_type" AS ENUM('client', 'company');
CREATE TABLE "segment_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar(32) NOT NULL,
	"custom_field" text NOT NULL,
	"custom_field_id" text NOT NULL,
	"entity_type" "custom_field_entity_type" DEFAULT 'client' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "uq_segment_configs__workspace_id" ON "segment_configs" USING btree ("workspace_id");

-- Delete existing segments (conditions and settings with segment_id cascade automatically)
DELETE FROM "segments";

-- Drop the trigger and function (no longer needed — custom field is centralized in segment_configs)
DROP TRIGGER IF EXISTS trg_segments_enforce_custom_field ON segments;
DROP FUNCTION IF EXISTS enforce_workspace_custom_field();

ALTER TABLE "segments" DROP COLUMN "custom_field";
ALTER TABLE "segments" DROP COLUMN "deleted_at";
