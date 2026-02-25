ALTER TABLE "actions" ALTER COLUMN "order" SET DEFAULT '["invoices","contracts","tasks","forms"]'::jsonb;
ALTER TABLE "actions" DROP COLUMN "messages";