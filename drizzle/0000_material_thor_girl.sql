-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."agent_prompt_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."agent_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."billing_provider_enum" AS ENUM('PADDLE', 'STRIPE');--> statement-breakpoint
CREATE TYPE "public"."conversation_mode_enum" AS ENUM('GENERAL', 'PDCA', 'DISCUSSION');--> statement-breakpoint
CREATE TYPE "public"."conversation_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."currency_code_enum" AS ENUM('USD', 'KRW', 'JPY');--> statement-breakpoint
CREATE TYPE "public"."file_provider_enum" AS ENUM('GROK', 'S3', 'LOCAL', 'AZURE');--> statement-breakpoint
CREATE TYPE "public"."file_status_enum" AS ENUM('PENDING', 'INDEXED', 'FAILED', 'SUCCESS');--> statement-breakpoint
CREATE TYPE "public"."friend_status_enum" AS ENUM('PENDING', 'USED', 'EXPIRED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."invitation_status_enum" AS ENUM('PENDING', 'USED', 'EXPIRED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."language_code_enum" AS ENUM('KR', 'EN', 'JP');--> statement-breakpoint
CREATE TYPE "public"."log_method_enum" AS ENUM('POST', 'GET', 'PUT', 'DELETE', 'PATCH');--> statement-breakpoint
CREATE TYPE "public"."onboarding_status_enum" AS ENUM('STEP_1', 'STEP_2', 'STEP_3', 'STEP_4', 'STEP_5', 'STEP_6', 'STEP_7', 'COMPLETE');--> statement-breakpoint
CREATE TYPE "public"."product_status_enum" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."product_type_enum" AS ENUM('SUBSCRIPTION', 'PURCHASE');--> statement-breakpoint
CREATE TYPE "public"."tool_category_enum" AS ENUM('SEARCH', 'GENERATION', 'OPERATION', 'DOCUMENTS', 'UTILITY', 'KNOWLEDGE_BASE', 'AMUSEMENT');--> statement-breakpoint
CREATE TYPE "public"."transaction_status_enum" AS ENUM('SUBSCRIPTION.ACTIVATED', 'SUBSCRIPTION.CANCELED', 'SUBSCRIPTION.CREATED', 'SUBSCRIPTION.IMPORTED', 'SUBSCRIPTION.PAST_DUE', 'SUBSCRIPTION.PAUSED', 'SUBSCRIPTION.RESUMED', 'SUBSCRIPTION.TRIALING', 'SUBSCRIPTION.UPDATED', 'TRANSACTION.BILLED', 'TRANSACTION.CANCELED', 'TRANSACTION.COMPLETED', 'TRANSACTION.CREATED', 'TRANSACTION.PAID', 'TRANSACTION.PAST_DUE', 'TRANSACTION.PAYMENT_FAILED', 'TRANSACTION.READY', 'TRANSACTION.REVISED', 'TRANSACTION.UPDATED');--> statement-breakpoint
CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."workflow_type_enum" AS ENUM('MAIN', 'PARTICIPANT-A', 'PARTICIPANT-B', 'ROLE-SETTER', 'DISCUSSION-SUMMARY', 'DISCUSSION-CRITIC', 'PLANNER', 'EXECUTOR', 'PDCA-SUMMARY', 'PDCA-CRITIC', 'BT-WORKFLOW', 'PRESENTATION');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"message" text,
	"invited_user_id" uuid,
	"status" "invitation_status_enum",
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"active_agent_prompt_history_id" uuid,
	"name" text NOT NULL,
	"persona" text,
	"about" text,
	"profile_image_url" text,
	"status" "agent_status_enum",
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "agent_prompt_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"suggested_persona" text NOT NULL,
	"analysis_summary" text,
	"status" "agent_prompt_status_enum",
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"user_id" uuid,
	"title" text,
	"mode" "conversation_mode_enum",
	"is_privacy_protected" boolean,
	"status" "conversation_status_enum",
	"share_token" text,
	"shared_at" timestamp with time zone,
	"bookmarked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"agent_id" uuid,
	"user_id" uuid,
	"joined_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "message_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"share_token" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"agent_id" uuid,
	"question" text,
	"content" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "rag_grok_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key" text,
	"management_key" text,
	"usage_limit" bigint,
	"usage_count" bigint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"profile_image_url" text,
	"language_code" "language_code_enum" DEFAULT 'KR',
	"status" "user_status_enum",
	"onboarding_status" "onboarding_status_enum",
	"is_vora" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"banned_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" text,
	"name" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"workflow_type" "workflow_type_enum" NOT NULL,
	"ai_model" text,
	"sort_order" integer
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"workflows_id" uuid NOT NULL,
	"user_id" uuid,
	"agent_id" uuid,
	"question" text,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"agent_id" uuid,
	"name" text,
	"size" bigint,
	"mime_type" text,
	"provider" "file_provider_enum",
	"provider_file_key" text,
	"provider_metadata" jsonb,
	"file_identifier" text,
	"metadata" jsonb,
	"extension" text,
	"status" "file_status_enum",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_payment_infos" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"billing_customer_id" text,
	"billing_provider" "billing_provider_enum",
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "tool_category_enum",
	"tool_code" text,
	"internal_usage_limit" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"is_free" boolean,
	"tier" integer,
	"icon_image_url" text,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "conversation_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"content" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "tool_i18n" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"language_code" "language_code_enum",
	"name" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "product_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tool_id" uuid NOT NULL,
	"quota_allocation" integer
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paddle_product_id" text,
	"is_active" boolean,
	"sort_order" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "message_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"file_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products_i18n" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"language_code" "language_code_enum",
	"name" text,
	"description" text,
	"currency_code" "currency_code_enum",
	"current_price" numeric,
	"price" numeric
);
--> statement-breakpoint
CREATE TABLE "user_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"product_id" uuid,
	"type" "product_type_enum",
	"status" "product_status_enum",
	"is_shared" boolean,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"next_billing_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "purchase_tool_quotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"tool_id" uuid NOT NULL,
	"allocated_amount" integer,
	"used_amount" integer,
	"remaining_amount" integer,
	"last_reset_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"provider" "billing_provider_enum",
	"external_transaction_id" text,
	"external_invoice_id" text,
	"amount" integer,
	"currency_code" "currency_code_enum",
	"status" "transaction_status_enum",
	"provider_metadata" jsonb,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "purchase_tool_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text,
	"quota_id" uuid,
	"tool_id" uuid,
	"extra_user_id" uuid,
	"conversation_id" uuid,
	"usage_amount" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "purchase_tool_usage_logs_type_check" CHECK (type = 'LICENSE'::text)
);
--> statement-breakpoint
CREATE TABLE "automation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"task_name" text,
	"instructions" text,
	"schedule_type" varchar(20),
	"schedule_time" time,
	"target_email" text,
	"n8n_workflow_id" text,
	"n8n_webhook_url" text,
	"input_params" jsonb,
	"is_active" boolean,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "task_execution_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"status" varchar(20),
	"external_execution_id" varchar(100),
	"result_summary" text,
	"error_message" text,
	"executed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_friends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"friend_user_id" uuid,
	"status" "friend_status_enum",
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "log_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"method" "log_method_enum",
	"path" text,
	"status_code" integer,
	"error_name" text,
	"message" text,
	"stack_trace" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "rag_user_relations" (
	"user_id" uuid NOT NULL,
	"key_id" uuid NOT NULL,
	"collection_id" text,
	"allocated_storage" bigint,
	"used_storage" bigint,
	CONSTRAINT "rag_user_relations_pkey" PRIMARY KEY("key_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "fk_accounts_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "fk_invitations_invited_user" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "fk_invitations_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "fk_ai_agents_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_prompt_histories" ADD CONSTRAINT "fk_agent_prompt_histories_agent" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "fk_participants_agent" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "fk_participants_conv" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "fk_participants_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_shares" ADD CONSTRAINT "fk_message_shares_agent" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_shares" ADD CONSTRAINT "fk_message_shares_conv" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_shares" ADD CONSTRAINT "fk_message_shares_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "fk_messages_agent" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "fk_messages_conv" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "fk_messages_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "fk_messages_workflows" FOREIGN KEY ("workflows_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "fk_files_agent" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "fk_files_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_infos" ADD CONSTRAINT "fk_payment_infos_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_artifacts" ADD CONSTRAINT "fk_artifacts_message" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_i18n" ADD CONSTRAINT "fk_tool_i18n_tool" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tools" ADD CONSTRAINT "fk_product_tools_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tools" ADD CONSTRAINT "fk_product_tools_tool" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_files" ADD CONSTRAINT "fk_message_files_file" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_files" ADD CONSTRAINT "fk_message_files_message" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products_i18n" ADD CONSTRAINT "fk_product_i18n_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_purchases" ADD CONSTRAINT "fk_licenses_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_purchases" ADD CONSTRAINT "fk_licenses_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tool_quotas" ADD CONSTRAINT "fk_quotas_license" FOREIGN KEY ("license_id") REFERENCES "public"."user_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tool_quotas" ADD CONSTRAINT "fk_quotas_tool" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "fk_transactions_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tool_usage_logs" ADD CONSTRAINT "fk_usage_logs_conv" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tool_usage_logs" ADD CONSTRAINT "fk_usage_logs_quota" FOREIGN KEY ("quota_id") REFERENCES "public"."purchase_tool_quotas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tool_usage_logs" ADD CONSTRAINT "fk_usage_logs_tool" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tool_usage_logs" ADD CONSTRAINT "fk_usage_logs_user" FOREIGN KEY ("extra_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_tasks" ADD CONSTRAINT "fk_automation_tasks_agent" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_execution_logs" ADD CONSTRAINT "fk_execution_logs_task" FOREIGN KEY ("task_id") REFERENCES "public"."automation_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "fk_friends_friend_user" FOREIGN KEY ("friend_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "fk_friends_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_errors" ADD CONSTRAINT "fk_log_errors_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_user_relations" ADD CONSTRAINT "fk_rag_user_relations_key" FOREIGN KEY ("key_id") REFERENCES "public"."rag_grok_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_user_relations" ADD CONSTRAINT "fk_rag_user_relations_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_sessions_token" ON "sessions" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_accounts_user_id" ON "accounts" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invitations_invited_user_id" ON "invitations" USING btree ("invited_user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invitations_token" ON "invitations" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "idx_invitations_user_id" ON "invitations" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_agents_active_prompt_id" ON "agents" USING btree ("active_agent_prompt_history_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_agents_user_id" ON "agents" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_prompt_histories_agent_id" ON "agent_prompt_histories" USING btree ("agent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_user_id" ON "conversations" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_participants_agent_id" ON "conversation_participants" USING btree ("agent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_participants_conv_id" ON "conversation_participants" USING btree ("conversation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_participants_user_id" ON "conversation_participants" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_agent_id" ON "messages" USING btree ("agent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_content_gin" ON "messages" USING gin ("content" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_conv_id" ON "messages" USING btree ("conversation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_question_trgm" ON "messages" USING gin ("question" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_user_id" ON "messages" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_workflows_id" ON "messages" USING btree ("workflows_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_files_agent_id" ON "files" USING btree ("agent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_files_user_id" ON "files" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_artifacts_message_id" ON "conversation_artifacts" USING btree ("message_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_tool_i18n_tool_id" ON "tool_i18n" USING btree ("tool_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_product_tools_product_id" ON "product_tools" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_product_tools_tool_id" ON "product_tools" USING btree ("tool_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_message_files_file_id" ON "message_files" USING btree ("file_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_message_files_message_id" ON "message_files" USING btree ("message_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_product_i18n_product_id" ON "products_i18n" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_purchase_product_id" ON "user_purchases" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_purchase_user_id" ON "user_purchases" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_quotas_license_id" ON "purchase_tool_quotas" USING btree ("license_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_quotas_tool_id" ON "purchase_tool_quotas" USING btree ("tool_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "payment_transactions" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_usage_logs_quota_id" ON "purchase_tool_usage_logs" USING btree ("quota_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_usage_logs_tool_id" ON "purchase_tool_usage_logs" USING btree ("tool_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_usage_logs_user_id" ON "purchase_tool_usage_logs" USING btree ("extra_user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_automation_tasks_agent_id" ON "automation_tasks" USING btree ("agent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_execution_logs_task_id" ON "task_execution_logs" USING btree ("task_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_friends_pair" ON "user_friends" USING btree ("user_id" uuid_ops,"friend_user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_log_errors_user_id" ON "log_errors" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_rag_relations_key_id" ON "rag_user_relations" USING btree ("key_id" uuid_ops);
*/