CREATE TYPE "public"."model_provider" AS ENUM('Alibaba', 'Anthropic', 'DeepSeek', 'Google', 'Moonshot', 'OpenAI', 'xAI');--> statement-breakpoint
CREATE TYPE "public"."model_type" AS ENUM('llm', 'vlm', 'embedding', 'ocr');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"role" text NOT NULL,
	"parts" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"parent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" "model_provider" NOT NULL,
	"name" text NOT NULL,
	"type" "model_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"pdf_id" text,
	"title" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annotations" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"path" text NOT NULL,
	"color" text NOT NULL,
	"size" smallint NOT NULL,
	"page" smallint NOT NULL,
	"pdf_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" text PRIMARY KEY NOT NULL,
	"rects" jsonb NOT NULL,
	"color" text NOT NULL,
	"text" text NOT NULL,
	"page_number" smallint NOT NULL,
	"pdf_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdf_indexing" (
	"id" text PRIMARY KEY NOT NULL,
	"pdf_id" text NOT NULL,
	"model" text NOT NULL,
	"summary" text NOT NULL,
	"level" text NOT NULL,
	"start_page" smallint,
	"end_page" smallint
);
--> statement-breakpoint
CREATE TABLE "pdf_parsing" (
	"id" text PRIMARY KEY NOT NULL,
	"pdf_id" text NOT NULL,
	"model" text NOT NULL,
	"text" text NOT NULL,
	"images" jsonb,
	"page" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdfs" (
	"id" text PRIMARY KEY NOT NULL,
	"page_count" smallint DEFAULT 0 NOT NULL,
	"scroll" jsonb DEFAULT '{"x":0,"y":0}'::jsonb NOT NULL,
	"zoom" numeric(4, 2) DEFAULT '1.00' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recordings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_parent_id_files_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_id_files_id_fk" FOREIGN KEY ("id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_pdf_id_pdfs_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."pdfs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_pdf_id_pdfs_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."pdfs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_pdf_id_pdfs_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."pdfs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdf_indexing" ADD CONSTRAINT "pdf_indexing_pdf_id_pdfs_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."pdfs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdf_parsing" ADD CONSTRAINT "pdf_parsing_pdf_id_pdfs_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."pdfs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdfs" ADD CONSTRAINT "pdfs_id_files_id_fk" FOREIGN KEY ("id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "chats_updated_at_idx" ON "chats" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "chats_created_at_idx" ON "chats" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "files_parent_id_idx" ON "files" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "files_type_idx" ON "files" USING btree ("type");--> statement-breakpoint
CREATE INDEX "files_created_at_idx" ON "files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "files_updated_at_idx" ON "files" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "notes_pdf_id_idx" ON "notes" USING btree ("pdf_id");--> statement-breakpoint
CREATE INDEX "annotations_pdf_id_idx" ON "annotations" USING btree ("pdf_id");--> statement-breakpoint
CREATE INDEX "highlights_pdf_id_idx" ON "highlights" USING btree ("pdf_id");--> statement-breakpoint
CREATE INDEX "recordings_duration_idx" ON "recordings" USING btree ("duration");--> statement-breakpoint
CREATE INDEX "recordings_created_at_idx" ON "recordings" USING btree ("created_at");