import { sqliteTable, text, integer, blob, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Areas table
export const areas = sqliteTable('areas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color').notNull().default('#6366f1'),
  description: text('description'),
  githubRepo: text('github_repo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Tasks table
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority', { enum: ['critical', 'high', 'medium', 'low'] }).notNull().default('medium'),
  status: text('status', { enum: ['todo', 'in-progress', 'done'] }).notNull().default('todo'),
  areaId: integer('area_id').references(() => areas.id, { onDelete: 'set null' }),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  githubIssueUrl: text('github_issue_url'),
  githubIssueNumber: integer('github_issue_number'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Bookmarks table
export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  areaId: integer('area_id').references(() => areas.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Notes table
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  areaId: integer('area_id').references(() => areas.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Tags table
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

// Item tags table (polymorphic)
export const itemTags = sqliteTable('item_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').notNull(),
  itemType: text('item_type', { enum: ['task', 'bookmark', 'note'] }).notNull(),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});

// Chat conversations table
export const chatConversations = sqliteTable('chat_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Chat messages table
export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system', 'tool'] }).notNull(),
  content: text('content').notNull(),
  toolCalls: text('tool_calls'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Recent searches table
export const recentSearches = sqliteTable('recent_searches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  query: text('query').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Embeddings table
export const embeddings = sqliteTable('embeddings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemType: text('item_type', { enum: ['task', 'bookmark', 'note', 'doc'] }).notNull(),
  itemId: integer('item_id').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  contentHash: text('content_hash').notNull(),
  embedding: blob('embedding').notNull(), // BLOB for Float32Array
  chunkText: text('chunk_text'),
  sourcePath: text('source_path'),
  model: text('model').notNull(),
  dimensions: integer('dimensions').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Daily logs table
export const dailyLogs = sqliteTable('daily_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(), // YYYY-MM-DD format
  summary: text('summary'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Daily entries table
export const dailyEntries = sqliteTable('daily_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  logId: integer('log_id').notNull().references(() => dailyLogs.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isHighlight: integer('is_highlight').notNull().default(0),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Embedding config table (key-value store)
export const embeddingConfig = sqliteTable('embedding_config', {
  key: text('key').notNull().primaryKey(),
  value: text('value').notNull(),
});

// FTS5 virtual table for search (will be created via raw SQL)
