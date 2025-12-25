CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"created_by_id" uuid NOT NULL,
	"name" varchar(1028) NOT NULL,
	"path" varchar(1028) NOT NULL,
	"alt" varchar(1028),
	"type" varchar(1028) NOT NULL,
	"size" varchar(1028) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"settings_id" uuid NOT NULL,
	"invoices" boolean DEFAULT false NOT NULL,
	"messages" boolean DEFAULT false NOT NULL,
	"contracts" boolean DEFAULT false NOT NULL,
	"tasks" boolean DEFAULT false NOT NULL,
	"forms" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_actions__settings_id" UNIQUE("settings_id")
);

CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"background_color" varchar(16) DEFAULT '#ffffff' NOT NULL,
	"banner_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "actions" ADD CONSTRAINT "actions_settings_id_settings_id_fk" FOREIGN KEY ("settings_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "settings" ADD CONSTRAINT "settings_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "idx_media__workspace_id" ON "media" USING btree ("workspace_id");
CREATE INDEX "idx_actions__workspace_id" ON "actions" USING btree ("workspace_id");
CREATE INDEX "idx_settings__workspace_id" ON "settings" USING btree ("workspace_id");