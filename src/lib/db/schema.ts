import { pgTable, uniqueIndex, index, foreignKey, uuid, text, timestamp, boolean, jsonb, bigint, integer, numeric, check, varchar, time, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const agentPromptStatusEnum = pgEnum("agent_prompt_status_enum", ['PENDING', 'ACCEPTED', 'REJECTED'])
export const agentStatusEnum = pgEnum("agent_status_enum", ['ACTIVE', 'INACTIVE', 'DELETED'])
export const billingProviderEnum = pgEnum("billing_provider_enum", ['PADDLE', 'STRIPE'])
export const conversationModeEnum = pgEnum("conversation_mode_enum", ['GENERAL', 'PDCA', 'DISCUSSION'])
export const conversationStatusEnum = pgEnum("conversation_status_enum", ['ACTIVE', 'COMPLETED', 'ARCHIVED'])
export const currencyCodeEnum = pgEnum("currency_code_enum", ['USD', 'KRW', 'JPY'])
export const fileProviderEnum = pgEnum("file_provider_enum", ['GROK', 'S3', 'LOCAL', 'AZURE'])
export const fileStatusEnum = pgEnum("file_status_enum", ['PENDING', 'INDEXED', 'FAILED', 'SUCCESS'])
export const friendStatusEnum = pgEnum("friend_status_enum", ['PENDING', 'USED', 'EXPIRED', 'CANCELED'])
export const invitationStatusEnum = pgEnum("invitation_status_enum", ['PENDING', 'USED', 'EXPIRED', 'CANCELED'])
export const languageCodeEnum = pgEnum("language_code_enum", ['KR', 'EN', 'JP'])
export const logMethodEnum = pgEnum("log_method_enum", ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'])
export const onboardingStatusEnum = pgEnum("onboarding_status_enum", ['STEP_1', 'STEP_2', 'STEP_3', 'STEP_4', 'STEP_5', 'STEP_6', 'STEP_7', 'COMPLETE'])
export const productStatusEnum = pgEnum("product_status_enum", ['ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED'])
export const productTypeEnum = pgEnum("product_type_enum", ['SUBSCRIPTION', 'PURCHASE'])
export const toolCategoryEnum = pgEnum("tool_category_enum", ['SEARCH', 'GENERATION', 'OPERATION', 'DOCUMENTS', 'UTILITY', 'KNOWLEDGE_BASE', 'AMUSEMENT'])
export const transactionStatusEnum = pgEnum("transaction_status_enum", ['SUBSCRIPTION.ACTIVATED', 'SUBSCRIPTION.CANCELED', 'SUBSCRIPTION.CREATED', 'SUBSCRIPTION.IMPORTED', 'SUBSCRIPTION.PAST_DUE', 'SUBSCRIPTION.PAUSED', 'SUBSCRIPTION.RESUMED', 'SUBSCRIPTION.TRIALING', 'SUBSCRIPTION.UPDATED', 'TRANSACTION.BILLED', 'TRANSACTION.CANCELED', 'TRANSACTION.COMPLETED', 'TRANSACTION.CREATED', 'TRANSACTION.PAID', 'TRANSACTION.PAST_DUE', 'TRANSACTION.PAYMENT_FAILED', 'TRANSACTION.READY', 'TRANSACTION.REVISED', 'TRANSACTION.UPDATED'])
export const userStatusEnum = pgEnum("user_status_enum", ['ACTIVE', 'SUSPENDED', 'WITHDRAWN'])
export const workflowTypeEnum = pgEnum("workflow_type_enum", ['MAIN', 'PARTICIPANT-A', 'PARTICIPANT-B', 'ROLE-SETTER', 'DISCUSSION-SUMMARY', 'DISCUSSION-CRITIC', 'PLANNER', 'EXECUTOR', 'PDCA-SUMMARY', 'PDCA-CRITIC', 'BT-WORKFLOW', 'PRESENTATION'])


export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	uniqueIndex("idx_sessions_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("idx_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_sessions_user"
	}).onDelete("cascade"),
]);

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: 'string' }),
	scope: text(),
	idToken: text("id_token"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_accounts_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_accounts_user"
	}).onDelete("cascade"),
]);

export const invitations = pgTable("invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	message: text(),
	invitedUserId: uuid("invited_user_id"),
	status: invitationStatusEnum(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	usedAt: timestamp("used_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("idx_invitations_invited_user_id").using("btree", table.invitedUserId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("idx_invitations_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("idx_invitations_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.invitedUserId],
		foreignColumns: [users.id],
		name: "fk_invitations_invited_user"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_invitations_user"
	}).onDelete("cascade"),
]);

export const agents = pgTable("agents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	activeAgentPromptHistoryId: uuid("active_agent_prompt_history_id"),
	name: text().notNull(),
	persona: text(),
	about: text(),
	profileImageUrl: text("profile_image_url"),
	status: agentStatusEnum(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_agents_active_prompt_id").using("btree", table.activeAgentPromptHistoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_agents_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_ai_agents_user"
	}).onDelete("cascade"),
]);

export const agentPromptHistories = pgTable("agent_prompt_histories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	suggestedPersona: text("suggested_persona").notNull(),
	analysisSummary: text("analysis_summary"),
	status: agentPromptStatusEnum(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	respondedAt: timestamp("responded_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_prompt_histories_agent_id").using("btree", table.agentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.agentId],
		foreignColumns: [agents.id],
		name: "fk_agent_prompt_histories_agent"
	}).onDelete("cascade"),
]);

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id"),
	userId: uuid("user_id"),
	title: text(),
	mode: conversationModeEnum(),
	isPrivacyProtected: boolean("is_privacy_protected"),
	status: conversationStatusEnum(),
	shareToken: text("share_token"),
	sharedAt: timestamp("shared_at", { withTimezone: true, mode: 'string' }),
	bookmarkedAt: timestamp("bookmarked_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_conversations_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
]);

export const conversationParticipants = pgTable("conversation_participants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	agentId: uuid("agent_id"),
	userId: uuid("user_id"),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_participants_agent_id").using("btree", table.agentId.asc().nullsLast().op("uuid_ops")),
	index("idx_participants_conv_id").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("idx_participants_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.agentId],
		foreignColumns: [agents.id],
		name: "fk_participants_agent"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.conversationId],
		foreignColumns: [conversations.id],
		name: "fk_participants_conv"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_participants_user"
	}).onDelete("set null"),
]);

export const verification = pgTable("verification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const messageShares = pgTable("message_shares", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	shareToken: uuid("share_token").defaultRandom(),
	userId: uuid("user_id"),
	agentId: uuid("agent_id"),
	question: text(),
	content: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
		columns: [table.agentId],
		foreignColumns: [agents.id],
		name: "fk_message_shares_agent"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.conversationId],
		foreignColumns: [conversations.id],
		name: "fk_message_shares_conv"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_message_shares_user"
	}).onDelete("set null"),
]);

export const ragGrokKeys = pgTable("rag_grok_keys", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	apiKey: text("api_key"),
	managementKey: text("management_key"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	usageLimit: bigint("usage_limit", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	usageCount: bigint("usage_count", { mode: "number" }).default(0),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	profileImageUrl: text("profile_image_url"),
	languageCode: languageCodeEnum("language_code").default('KR'),
	status: userStatusEnum(),
	onboardingStatus: onboardingStatusEnum("onboarding_status"),
	isVora: boolean("is_vora").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	bannedUntil: timestamp("banned_until", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const workflows = pgTable("workflows", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workflowId: text("workflow_id"),
	name: text(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	workflowType: workflowTypeEnum("workflow_type").notNull(),
	aiModel: text("ai_model"),
	sortOrder: integer("sort_order"),
});

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	workflowsId: uuid("workflows_id").notNull(),
	userId: uuid("user_id"),
	agentId: uuid("agent_id"),
	question: text(),
	content: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_messages_agent_id").using("btree", table.agentId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_content_gin").using("gin", table.content.asc().nullsLast().op("jsonb_ops")),
	index("idx_messages_conv_id").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_question_trgm").using("gin", table.question.asc().nullsLast().op("gin_trgm_ops")),
	index("idx_messages_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_workflows_id").using("btree", table.workflowsId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.agentId],
		foreignColumns: [agents.id],
		name: "fk_messages_agent"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.conversationId],
		foreignColumns: [conversations.id],
		name: "fk_messages_conv"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_messages_user"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.workflowsId],
		foreignColumns: [workflows.id],
		name: "fk_messages_workflows"
	}),
]);

export const files = pgTable("files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	agentId: uuid("agent_id"),
	name: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	size: bigint({ mode: "number" }),
	mimeType: text("mime_type"),
	provider: fileProviderEnum(),
	providerFileKey: text("provider_file_key"),
	providerMetadata: jsonb("provider_metadata"),
	fileIdentifier: text("file_identifier"),
	metadata: jsonb(),
	extension: text(),
	status: fileStatusEnum(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_files_agent_id").using("btree", table.agentId.asc().nullsLast().op("uuid_ops")),
	index("idx_files_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.agentId],
		foreignColumns: [agents.id],
		name: "fk_files_agent"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_files_user"
	}).onDelete("set null"),
]);

export const userPaymentInfos = pgTable("user_payment_infos", {
	userId: uuid("user_id").primaryKey().notNull(),
	billingCustomerId: text("billing_customer_id"),
	billingProvider: billingProviderEnum("billing_provider"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_payment_infos_user"
	}).onDelete("cascade"),
]);

export const tools = pgTable("tools", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	category: toolCategoryEnum(),
	toolCode: text("tool_code"),
	internalUsageLimit: integer("internal_usage_limit"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	isFree: boolean("is_free"),
	tier: integer(),
	iconImageUrl: text("icon_image_url"),
	isActive: boolean("is_active").default(true),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const conversationArtifacts = pgTable("conversation_artifacts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id").notNull(),
	content: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_artifacts_message_id").using("btree", table.messageId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.messageId],
		foreignColumns: [messages.id],
		name: "fk_artifacts_message"
	}).onDelete("cascade"),
]);

export const toolI18N = pgTable("tool_i18n", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	toolId: uuid("tool_id").notNull(),
	languageCode: languageCodeEnum("language_code"),
	name: text(),
	description: text(),
}, (table) => [
	index("idx_tool_i18n_tool_id").using("btree", table.toolId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.toolId],
		foreignColumns: [tools.id],
		name: "fk_tool_i18n_tool"
	}).onDelete("cascade"),
]);

export const productTools = pgTable("product_tools", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	toolId: uuid("tool_id").notNull(),
	quotaAllocation: integer("quota_allocation"),
}, (table) => [
	index("idx_product_tools_product_id").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("idx_product_tools_tool_id").using("btree", table.toolId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "fk_product_tools_product"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.toolId],
		foreignColumns: [tools.id],
		name: "fk_product_tools_tool"
	}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	paddleProductId: text("paddle_product_id"),
	isActive: boolean("is_active"),
	sortOrder: integer("sort_order"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const messageFiles = pgTable("message_files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id").notNull(),
	fileId: uuid("file_id").notNull(),
}, (table) => [
	index("idx_message_files_file_id").using("btree", table.fileId.asc().nullsLast().op("uuid_ops")),
	index("idx_message_files_message_id").using("btree", table.messageId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.fileId],
		foreignColumns: [files.id],
		name: "fk_message_files_file"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.messageId],
		foreignColumns: [messages.id],
		name: "fk_message_files_message"
	}).onDelete("cascade"),
]);

export const productsI18N = pgTable("products_i18n", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	languageCode: languageCodeEnum("language_code"),
	name: text(),
	description: text(),
	currencyCode: currencyCodeEnum("currency_code"),
	currentPrice: numeric("current_price"),
	price: numeric(),
}, (table) => [
	index("idx_product_i18n_product_id").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "fk_product_i18n_product"
	}).onDelete("cascade"),
]);

export const userPurchases = pgTable("user_purchases", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	productId: uuid("product_id"),
	type: productTypeEnum(),
	status: productStatusEnum(),
	isShared: boolean("is_shared"),
	currentPeriodStart: timestamp("current_period_start", { withTimezone: true, mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }),
	nextBillingDate: timestamp("next_billing_date", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_purchase_product_id").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("idx_purchase_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "fk_licenses_product"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_licenses_user"
	}).onDelete("set null"),
]);

export const purchaseToolQuotas = pgTable("purchase_tool_quotas", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	licenseId: uuid("license_id").notNull(),
	toolId: uuid("tool_id").notNull(),
	allocatedAmount: integer("allocated_amount"),
	usedAmount: integer("used_amount"),
	remainingAmount: integer("remaining_amount"),
	lastResetAt: timestamp("last_reset_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_quotas_license_id").using("btree", table.licenseId.asc().nullsLast().op("uuid_ops")),
	index("idx_quotas_tool_id").using("btree", table.toolId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.licenseId],
		foreignColumns: [userPurchases.id],
		name: "fk_quotas_license"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.toolId],
		foreignColumns: [tools.id],
		name: "fk_quotas_tool"
	}).onDelete("cascade"),
]);

export const paymentTransactions = pgTable("payment_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	provider: billingProviderEnum(),
	externalTransactionId: text("external_transaction_id"),
	externalInvoiceId: text("external_invoice_id"),
	amount: integer(),
	currencyCode: currencyCodeEnum("currency_code"),
	status: transactionStatusEnum(),
	providerMetadata: jsonb("provider_metadata"),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_transactions_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_transactions_user"
	}).onDelete("set null"),
]);

export const purchaseToolUsageLogs = pgTable("purchase_tool_usage_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: text(),
	quotaId: uuid("quota_id"),
	toolId: uuid("tool_id"),
	extraUserId: uuid("extra_user_id"),
	conversationId: uuid("conversation_id"),
	usageAmount: integer("usage_amount"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_usage_logs_quota_id").using("btree", table.quotaId.asc().nullsLast().op("uuid_ops")),
	index("idx_usage_logs_tool_id").using("btree", table.toolId.asc().nullsLast().op("uuid_ops")),
	index("idx_usage_logs_user_id").using("btree", table.extraUserId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.conversationId],
		foreignColumns: [conversations.id],
		name: "fk_usage_logs_conv"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.quotaId],
		foreignColumns: [purchaseToolQuotas.id],
		name: "fk_usage_logs_quota"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.toolId],
		foreignColumns: [tools.id],
		name: "fk_usage_logs_tool"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.extraUserId],
		foreignColumns: [users.id],
		name: "fk_usage_logs_user"
	}).onDelete("set null"),
	check("purchase_tool_usage_logs_type_check", sql`type = 'LICENSE'::text`),
]);

export const automationTasks = pgTable("automation_tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id"),
	taskName: text("task_name"),
	instructions: text(),
	scheduleType: varchar("schedule_type", { length: 20 }),
	scheduleTime: time("schedule_time"),
	targetEmail: text("target_email"),
	n8NWorkflowId: text("n8n_workflow_id"),
	n8NWebhookUrl: text("n8n_webhook_url"),
	inputParams: jsonb("input_params"),
	isActive: boolean("is_active"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_automation_tasks_agent_id").using("btree", table.agentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.agentId],
		foreignColumns: [agents.id],
		name: "fk_automation_tasks_agent"
	}).onDelete("cascade"),
]);

export const taskExecutionLogs = pgTable("task_execution_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	taskId: uuid("task_id").notNull(),
	status: varchar({ length: 20 }),
	externalExecutionId: varchar("external_execution_id", { length: 100 }),
	resultSummary: text("result_summary"),
	errorMessage: text("error_message"),
	executedAt: timestamp("executed_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_execution_logs_task_id").using("btree", table.taskId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.taskId],
		foreignColumns: [automationTasks.id],
		name: "fk_execution_logs_task"
	}).onDelete("cascade"),
]);

export const userFriends = pgTable("user_friends", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	friendUserId: uuid("friend_user_id"),
	status: friendStatusEnum(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	uniqueIndex("idx_user_friends_pair").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.friendUserId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.friendUserId],
		foreignColumns: [users.id],
		name: "fk_friends_friend_user"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_friends_user"
	}).onDelete("cascade"),
]);

export const logErrors = pgTable("log_errors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	method: logMethodEnum(),
	path: text(),
	statusCode: integer("status_code"),
	errorName: text("error_name"),
	message: text(),
	stackTrace: text("stack_trace"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_log_errors_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_log_errors_user"
	}).onDelete("set null"),
]);

export const ragUserRelations = pgTable("rag_user_relations", {
	userId: uuid("user_id").notNull(),
	keyId: uuid("key_id").notNull(),
	collectionId: text("collection_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	allocatedStorage: bigint("allocated_storage", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	usedStorage: bigint("used_storage", { mode: "number" }),
}, (table) => [
	index("idx_rag_relations_key_id").using("btree", table.keyId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.keyId],
		foreignColumns: [ragGrokKeys.id],
		name: "fk_rag_user_relations_key"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "fk_rag_user_relations_user"
	}).onDelete("cascade"),
	primaryKey({ columns: [table.keyId, table.userId], name: "rag_user_relations_pkey" }),
]);
