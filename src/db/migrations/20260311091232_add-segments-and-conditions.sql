CREATE TABLE "conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"segment_id" uuid NOT NULL,
	"compare_value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar(32) NOT NULL,
	"created_by_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"custom_field" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

ALTER TABLE "settings" ADD COLUMN "segment_id" uuid;
ALTER TABLE "conditions" ADD CONSTRAINT "conditions_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "idx_conditions__segment_id" ON "conditions" USING btree ("segment_id");
CREATE INDEX "idx_segments__workspace_id" ON "segments" USING btree ("workspace_id");
ALTER TABLE "settings" ADD CONSTRAINT "settings_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "settings" ADD CONSTRAINT "uq_settings__workspace_id_segment_id" UNIQUE("workspace_id","segment_id");

-- Trigger: ensure all segments in a workspace share the same custom_field
CREATE OR REPLACE FUNCTION enforce_workspace_custom_field()
RETURNS TRIGGER AS $$
DECLARE
  existing_custom_field text;
BEGIN
  SELECT s.custom_field INTO existing_custom_field
  FROM segments s
  WHERE s.workspace_id = NEW.workspace_id
    AND s.deleted_at IS NULL
    AND s.id != NEW.id
  LIMIT 1;

  IF existing_custom_field IS NOT NULL AND existing_custom_field != NEW.custom_field THEN
    RAISE EXCEPTION 'All segments in workspace "%" must use the same custom_field. Expected "%" but got "%".',
      NEW.workspace_id, existing_custom_field, NEW.custom_field;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_segments_enforce_custom_field
  BEFORE INSERT OR UPDATE ON segments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_workspace_custom_field();