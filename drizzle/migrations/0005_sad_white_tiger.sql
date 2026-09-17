ALTER TABLE "platform_config" ADD COLUMN "pay_per_article_default_cents" integer;--> statement-breakpoint
UPDATE "platform_config" SET "pay_per_article_default_cents" = 499 WHERE "pay_per_article_default_cents" IS NULL;--> statement-breakpoint
ALTER TABLE "platform_config" ALTER COLUMN "pay_per_article_default_cents" SET NOT NULL;