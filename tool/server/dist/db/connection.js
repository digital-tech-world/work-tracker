"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = require("drizzle-orm/better-sqlite3");
const better_sqlite3_2 = __importDefault(require("better-sqlite3"));
const path_1 = require("path");
const fs_1 = require("fs");
const schema_1 = require("./schema");
// Ensure data directory exists
// Use /tmp to avoid WSL2 shared memory issues
const dataDir = (0, path_1.join)('/tmp', 'work-tracker-data');
(0, fs_1.mkdirSync)(dataDir, { recursive: true });
// Create SQLite database connection
const sqlite = new better_sqlite3_2.default((0, path_1.join)(dataDir, 'work-tracker.db'));
// Use OFF journal mode and other settings to avoid shared memory issues in WSL2
sqlite.pragma('journal_mode = OFF');
sqlite.pragma('synchronous = OFF');
sqlite.pragma('temp_store = MEMORY');
sqlite.pragma('mmap_size = 0');
sqlite.pragma('foreign_keys = ON');
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    description TEXT,
    github_repo TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'todo',
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    due_date INTEGER,
    github_issue_url TEXT,
    github_issue_number INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS item_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    item_type TEXT NOT NULL,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS chat_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tool_calls TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS recent_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content_hash TEXT NOT NULL,
    embedding BLOB NOT NULL,
    chunk_text TEXT,
    source_path TEXT,
    model TEXT NOT NULL,
    dimensions INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    summary TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS daily_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_highlight INTEGER NOT NULL DEFAULT 0,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS embedding_config (
    key TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
  );
`);
// Create FTS5 virtual table for search
sqlite.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
    title,
    content,
    item_type UNINDEXED,
    item_id UNINDEXED,
    tokenize = porter
  );
`);
// Create triggers to keep FTS5 in sync
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS tasks_fts_insert AFTER INSERT ON tasks BEGIN
    INSERT INTO search_index (rowid, title, content, item_type, item_id)
    VALUES (new.id, new.title, COALESCE(new.description, ''), 'task', new.id);
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS tasks_fts_delete AFTER DELETE ON tasks BEGIN
    DELETE FROM search_index WHERE rowid = old.id AND item_type = 'task';
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS tasks_fts_update AFTER UPDATE ON tasks BEGIN
    DELETE FROM search_index WHERE rowid = old.id AND item_type = 'task';
    INSERT INTO search_index (rowid, title, content, item_type, item_id)
    VALUES (new.id, new.title, COALESCE(new.description, ''), 'task', new.id);
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS bookmarks_fts_insert AFTER INSERT ON bookmarks BEGIN
    INSERT INTO search_index (rowid, title, content, item_type, item_id)
    VALUES (new.id, new.title, COALESCE(new.description, ''), 'bookmark', new.id);
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS bookmarks_fts_delete AFTER DELETE ON bookmarks BEGIN
    DELETE FROM search_index WHERE rowid = old.id AND item_type = 'bookmark';
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS bookmarks_fts_update AFTER UPDATE ON bookmarks BEGIN
    DELETE FROM search_index WHERE rowid = old.id AND item_type = 'bookmark';
    INSERT INTO search_index (rowid, title, content, item_type, item_id)
    VALUES (new.id, new.title, COALESCE(new.description, ''), 'bookmark', new.id);
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes BEGIN
    INSERT INTO search_index (rowid, title, content, item_type, item_id)
    VALUES (new.id, new.title, new.content, 'note', new.id);
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes BEGIN
    DELETE FROM search_index WHERE rowid = old.id AND item_type = 'note';
  END;
`);
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes BEGIN
    DELETE FROM search_index WHERE rowid = old.id AND item_type = 'note';
    INSERT INTO search_index (rowid, title, content, item_type, item_id)
    VALUES (new.id, new.title, new.content, 'note', new.id);
  END;
`);
// Create drizzle instance
exports.db = (0, better_sqlite3_1.drizzle)(sqlite, {
    schema: {
        areas: schema_1.areas,
        bookmarks: schema_1.bookmarks,
        chatConversations: schema_1.chatConversations,
        chatMessages: schema_1.chatMessages,
        dailyEntries: schema_1.dailyEntries,
        dailyLogs: schema_1.dailyLogs,
        embeddings: schema_1.embeddings,
        embeddingConfig: schema_1.embeddingConfig,
        itemTags: schema_1.itemTags,
        notes: schema_1.notes,
        recentSearches: schema_1.recentSearches,
        tasks: schema_1.tasks,
        tags: schema_1.tags,
    }
});
exports.default = exports.db;
