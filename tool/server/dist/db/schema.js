"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingConfig = exports.dailyEntries = exports.dailyLogs = exports.embeddings = exports.recentSearches = exports.chatMessages = exports.chatConversations = exports.itemTags = exports.tags = exports.notes = exports.bookmarks = exports.tasks = exports.areas = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
// Areas table
exports.areas = (0, sqlite_core_1.sqliteTable)('areas', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull().unique(),
    color: (0, sqlite_core_1.text)('color').notNull().default('#6366f1'),
    description: (0, sqlite_core_1.text)('description'),
    githubRepo: (0, sqlite_core_1.text)('github_repo'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Tasks table
exports.tasks = (0, sqlite_core_1.sqliteTable)('tasks', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    priority: (0, sqlite_core_1.text)('priority', { enum: ['critical', 'high', 'medium', 'low'] }).notNull().default('medium'),
    status: (0, sqlite_core_1.text)('status', { enum: ['todo', 'in-progress', 'done'] }).notNull().default('todo'),
    areaId: (0, sqlite_core_1.integer)('area_id').references(() => exports.areas.id, { onDelete: 'set null' }),
    dueDate: (0, sqlite_core_1.integer)('due_date', { mode: 'timestamp' }),
    githubIssueUrl: (0, sqlite_core_1.text)('github_issue_url'),
    githubIssueNumber: (0, sqlite_core_1.integer)('github_issue_number'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Bookmarks table
exports.bookmarks = (0, sqlite_core_1.sqliteTable)('bookmarks', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    url: (0, sqlite_core_1.text)('url').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    areaId: (0, sqlite_core_1.integer)('area_id').references(() => exports.areas.id, { onDelete: 'set null' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Notes table
exports.notes = (0, sqlite_core_1.sqliteTable)('notes', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    content: (0, sqlite_core_1.text)('content').notNull(),
    areaId: (0, sqlite_core_1.integer)('area_id').references(() => exports.areas.id, { onDelete: 'set null' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Tags table
exports.tags = (0, sqlite_core_1.sqliteTable)('tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull().unique(),
});
// Item tags table (polymorphic)
exports.itemTags = (0, sqlite_core_1.sqliteTable)('item_tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    itemId: (0, sqlite_core_1.integer)('item_id').notNull(),
    itemType: (0, sqlite_core_1.text)('item_type', { enum: ['task', 'bookmark', 'note'] }).notNull(),
    tagId: (0, sqlite_core_1.integer)('tag_id').notNull().references(() => exports.tags.id, { onDelete: 'cascade' }),
});
// Chat conversations table
exports.chatConversations = (0, sqlite_core_1.sqliteTable)('chat_conversations', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Chat messages table
exports.chatMessages = (0, sqlite_core_1.sqliteTable)('chat_messages', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    conversationId: (0, sqlite_core_1.integer)('conversation_id').notNull().references(() => exports.chatConversations.id, { onDelete: 'cascade' }),
    role: (0, sqlite_core_1.text)('role', { enum: ['user', 'assistant', 'system', 'tool'] }).notNull(),
    content: (0, sqlite_core_1.text)('content').notNull(),
    toolCalls: (0, sqlite_core_1.text)('tool_calls'), // JSON string
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Recent searches table
exports.recentSearches = (0, sqlite_core_1.sqliteTable)('recent_searches', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    query: (0, sqlite_core_1.text)('query').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Embeddings table
exports.embeddings = (0, sqlite_core_1.sqliteTable)('embeddings', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    itemType: (0, sqlite_core_1.text)('item_type', { enum: ['task', 'bookmark', 'note', 'doc'] }).notNull(),
    itemId: (0, sqlite_core_1.integer)('item_id').notNull(),
    chunkIndex: (0, sqlite_core_1.integer)('chunk_index').notNull(),
    contentHash: (0, sqlite_core_1.text)('content_hash').notNull(),
    embedding: (0, sqlite_core_1.blob)('embedding').notNull(), // BLOB for Float32Array
    chunkText: (0, sqlite_core_1.text)('chunk_text'),
    sourcePath: (0, sqlite_core_1.text)('source_path'),
    model: (0, sqlite_core_1.text)('model').notNull(),
    dimensions: (0, sqlite_core_1.integer)('dimensions').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Daily logs table
exports.dailyLogs = (0, sqlite_core_1.sqliteTable)('daily_logs', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    date: (0, sqlite_core_1.text)('date').notNull().unique(), // YYYY-MM-DD format
    summary: (0, sqlite_core_1.text)('summary'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Daily entries table
exports.dailyEntries = (0, sqlite_core_1.sqliteTable)('daily_entries', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    logId: (0, sqlite_core_1.integer)('log_id').notNull().references(() => exports.dailyLogs.id, { onDelete: 'cascade' }),
    text: (0, sqlite_core_1.text)('text').notNull(),
    isHighlight: (0, sqlite_core_1.integer)('is_highlight').notNull().default(0),
    taskId: (0, sqlite_core_1.integer)('task_id').references(() => exports.tasks.id, { onDelete: 'set null' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
// Embedding config table (key-value store)
exports.embeddingConfig = (0, sqlite_core_1.sqliteTable)('embedding_config', {
    key: (0, sqlite_core_1.text)('key').notNull().primaryKey(),
    value: (0, sqlite_core_1.text)('value').notNull(),
});
// FTS5 virtual table for search (will be created via raw SQL)
