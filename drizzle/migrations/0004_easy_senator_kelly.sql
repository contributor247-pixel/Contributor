ALTER TABLE "ledger" ADD COLUMN "payer_id" uuid;--> statement-breakpoint
UPDATE "ledger" l SET "payer_id" = p."user_id" FROM "purchases" p WHERE l."source_type" = 'purchase' AND l."source_id" = p."id" AND l."payer_id" IS NULL;--> statement-breakpoint
UPDATE "ledger" l SET "payer_id" = s."user_id" FROM "subscriptions" s WHERE l."source_type" IN ('publication_subscription', 'platform_subscription') AND l."source_id" = s."id" AND l."payer_id" IS NULL;--> statement-breakpoint
ALTER TABLE "ledger" ALTER COLUMN "payer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_payer_id_users_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;