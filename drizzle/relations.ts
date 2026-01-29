import {
  accounts,
  agentPromptHistories,
  agents,
  automationTasks,
  conversationArtifacts,
  conversationParticipants,
  conversations,
  files,
  invitations,
  logErrors,
  messageFiles,
  messages,
  messageShares,
  paymentTransactions,
  products,
  productsI18N,
  productTools,
  purchaseToolQuotas,
  purchaseToolUsageLogs,
  ragGrokKeys,
  ragUserRelations,
  sessions,
  taskExecutionLogs,
  toolI18N,
  tools,
  userFeeds,
  userFriends,
  userPaymentInfos,
  userPurchases,
  users,
  workflows,
} from "./schema";
import { relations } from "drizzle-orm/relations";

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  invitations_invitedUserId: many(invitations, {
    relationName: "invitations_invitedUserId_users_id",
  }),
  invitations_userId: many(invitations, {
    relationName: "invitations_userId_users_id",
  }),
  agents: many(agents),
  conversationParticipants: many(conversationParticipants),
  messageShares: many(messageShares),
  messages: many(messages),
  files: many(files),
  userPaymentInfos: many(userPaymentInfos),
  userPurchases: many(userPurchases),
  paymentTransactions: many(paymentTransactions),
  purchaseToolUsageLogs: many(purchaseToolUsageLogs),
  userFeeds: many(userFeeds),
  userFriends_friendUserId: many(userFriends, {
    relationName: "userFriends_friendUserId_users_id",
  }),
  userFriends_userId: many(userFriends, {
    relationName: "userFriends_userId_users_id",
  }),
  logErrors: many(logErrors),
  ragUserRelations: many(ragUserRelations),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  user_invitedUserId: one(users, {
    fields: [invitations.invitedUserId],
    references: [users.id],
    relationName: "invitations_invitedUserId_users_id",
  }),
  user_userId: one(users, {
    fields: [invitations.userId],
    references: [users.id],
    relationName: "invitations_userId_users_id",
  }),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  agentPromptHistories: many(agentPromptHistories),
  conversationParticipants: many(conversationParticipants),
  messageShares: many(messageShares),
  messages: many(messages),
  files: many(files),
  automationTasks: many(automationTasks),
}));

export const agentPromptHistoriesRelations = relations(
  agentPromptHistories,
  ({ one }) => ({
    agent: one(agents, {
      fields: [agentPromptHistories.agentId],
      references: [agents.id],
    }),
  }),
);

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    agent: one(agents, {
      fields: [conversationParticipants.agentId],
      references: [agents.id],
    }),
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const conversationsRelations = relations(conversations, ({ many }) => ({
  conversationParticipants: many(conversationParticipants),
  messageShares: many(messageShares),
  messages: many(messages),
  purchaseToolUsageLogs: many(purchaseToolUsageLogs),
  userFeeds: many(userFeeds),
}));

export const messageSharesRelations = relations(messageShares, ({ one }) => ({
  agent: one(agents, {
    fields: [messageShares.agentId],
    references: [agents.id],
  }),
  conversation: one(conversations, {
    fields: [messageShares.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [messageShares.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  agent: one(agents, {
    fields: [messages.agentId],
    references: [agents.id],
  }),
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  workflow: one(workflows, {
    fields: [messages.workflowsId],
    references: [workflows.id],
  }),
  conversationArtifacts: many(conversationArtifacts),
  messageFiles: many(messageFiles),
}));

export const workflowsRelations = relations(workflows, ({ many }) => ({
  messages: many(messages),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  agent: one(agents, {
    fields: [files.agentId],
    references: [agents.id],
  }),
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  messageFiles: many(messageFiles),
}));

export const userPaymentInfosRelations = relations(
  userPaymentInfos,
  ({ one }) => ({
    user: one(users, {
      fields: [userPaymentInfos.userId],
      references: [users.id],
    }),
  }),
);

export const conversationArtifactsRelations = relations(
  conversationArtifacts,
  ({ one }) => ({
    message: one(messages, {
      fields: [conversationArtifacts.messageId],
      references: [messages.id],
    }),
  }),
);

export const toolI18NRelations = relations(toolI18N, ({ one }) => ({
  tool: one(tools, {
    fields: [toolI18N.toolId],
    references: [tools.id],
  }),
}));

export const toolsRelations = relations(tools, ({ many }) => ({
  toolI18NS: many(toolI18N),
  productTools: many(productTools),
  purchaseToolQuotas: many(purchaseToolQuotas),
  purchaseToolUsageLogs: many(purchaseToolUsageLogs),
}));

export const productToolsRelations = relations(productTools, ({ one }) => ({
  product: one(products, {
    fields: [productTools.productId],
    references: [products.id],
  }),
  tool: one(tools, {
    fields: [productTools.toolId],
    references: [tools.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  productTools: many(productTools),
  productsI18NS: many(productsI18N),
  userPurchases: many(userPurchases),
}));

export const messageFilesRelations = relations(messageFiles, ({ one }) => ({
  file: one(files, {
    fields: [messageFiles.fileId],
    references: [files.id],
  }),
  message: one(messages, {
    fields: [messageFiles.messageId],
    references: [messages.id],
  }),
}));

export const productsI18NRelations = relations(productsI18N, ({ one }) => ({
  product: one(products, {
    fields: [productsI18N.productId],
    references: [products.id],
  }),
}));

export const userPurchasesRelations = relations(
  userPurchases,
  ({ one, many }) => ({
    product: one(products, {
      fields: [userPurchases.productId],
      references: [products.id],
    }),
    user: one(users, {
      fields: [userPurchases.userId],
      references: [users.id],
    }),
    purchaseToolQuotas: many(purchaseToolQuotas),
  }),
);

export const purchaseToolQuotasRelations = relations(
  purchaseToolQuotas,
  ({ one, many }) => ({
    userPurchase: one(userPurchases, {
      fields: [purchaseToolQuotas.licenseId],
      references: [userPurchases.id],
    }),
    tool: one(tools, {
      fields: [purchaseToolQuotas.toolId],
      references: [tools.id],
    }),
    purchaseToolUsageLogs: many(purchaseToolUsageLogs),
  }),
);

export const paymentTransactionsRelations = relations(
  paymentTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [paymentTransactions.userId],
      references: [users.id],
    }),
  }),
);

export const purchaseToolUsageLogsRelations = relations(
  purchaseToolUsageLogs,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [purchaseToolUsageLogs.conversationId],
      references: [conversations.id],
    }),
    purchaseToolQuota: one(purchaseToolQuotas, {
      fields: [purchaseToolUsageLogs.quotaId],
      references: [purchaseToolQuotas.id],
    }),
    tool: one(tools, {
      fields: [purchaseToolUsageLogs.toolId],
      references: [tools.id],
    }),
    user: one(users, {
      fields: [purchaseToolUsageLogs.extraUserId],
      references: [users.id],
    }),
  }),
);

export const automationTasksRelations = relations(
  automationTasks,
  ({ one, many }) => ({
    agent: one(agents, {
      fields: [automationTasks.agentId],
      references: [agents.id],
    }),
    taskExecutionLogs: many(taskExecutionLogs),
  }),
);

export const taskExecutionLogsRelations = relations(
  taskExecutionLogs,
  ({ one }) => ({
    automationTask: one(automationTasks, {
      fields: [taskExecutionLogs.taskId],
      references: [automationTasks.id],
    }),
  }),
);

export const userFeedsRelations = relations(userFeeds, ({ one }) => ({
  user: one(users, {
    fields: [userFeeds.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [userFeeds.conversationId],
    references: [conversations.id],
  }),
}));

export const userFriendsRelations = relations(userFriends, ({ one }) => ({
  user_friendUserId: one(users, {
    fields: [userFriends.friendUserId],
    references: [users.id],
    relationName: "userFriends_friendUserId_users_id",
  }),
  user_userId: one(users, {
    fields: [userFriends.userId],
    references: [users.id],
    relationName: "userFriends_userId_users_id",
  }),
}));

export const logErrorsRelations = relations(logErrors, ({ one }) => ({
  user: one(users, {
    fields: [logErrors.userId],
    references: [users.id],
  }),
}));

export const ragUserRelationsRelations = relations(
  ragUserRelations,
  ({ one }) => ({
    ragGrokKey: one(ragGrokKeys, {
      fields: [ragUserRelations.keyId],
      references: [ragGrokKeys.id],
    }),
    user: one(users, {
      fields: [ragUserRelations.userId],
      references: [users.id],
    }),
  }),
);

export const ragGrokKeysRelations = relations(ragGrokKeys, ({ many }) => ({
  ragUserRelations: many(ragUserRelations),
}));
