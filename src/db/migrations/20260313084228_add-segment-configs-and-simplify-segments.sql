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

-- Backfill: migrate existing segment custom fields into segment_configs (one per workspace)
INSERT INTO "segment_configs" ("workspace_id", "custom_field", "custom_field_id", "entity_type")
SELECT DISTINCT ON (s.workspace_id)
  s.workspace_id,
  s.custom_field,
  '',
  'client'
FROM "segments" s
WHERE s.deleted_at IS NULL
ORDER BY s.workspace_id, s.created_at ASC;

-- Drop the trigger and function (no longer needed — custom field is centralized in segment_configs)
DROP TRIGGER IF EXISTS trg_segments_enforce_custom_field ON segments;
DROP FUNCTION IF EXISTS enforce_workspace_custom_field();

ALTER TABLE "segments" DROP COLUMN "custom_field";
ALTER TABLE "segments" DROP COLUMN "deleted_at";
