# Work Tracker

A fully local, single-user web app for tracking tasks, bookmarks, notes, and daily work logs across multiple work areas.

## Features

- [x] Full-stack TypeScript monorepo
- [x] Frontend: React 18, Vite, TailwindCSS 3, React Router 6, TanStack React Query, TanStack React Table, Lucide icons
- [x] Backend: Express 4, TypeScript, better-sqlite3, Drizzle ORM, Zod, Octokit
- [/] AI (optional): Ollama for local LLM chat and embeddings (gracefully degrades if unavailable)
- [x] Dev: concurrently to run server + client in parallel

## Project Structure

- [x] `tool/` - All application code
  - [x] `shared/` - Shared types, Zod schemas, constants
  - [x] `server/` - Express backend
    - [x] `db/` - Drizzle schema, connection (WAL mode, FK enforcement), FTS5 setup, seed
    - [x] `routes/` - Express routers (one per entity)
    - [/] `services/` - AI/RAG services
    - [x] `middleware/` - Error handler
  - [x] `client/` - React frontend
    - [x] `pages/` - Route-level components
    - [x] `components/` - layout/, common/, ui/, per-entity form/table components, chat/
    - [x] `hooks/` - React Query hooks (one per entity)
    - [x] `lib/` - API client, query keys, utils
- [x] `data/` - SQLite database (gitignored, auto-created)
- [x] `docs/` - User documentation files (scanned by the app)

## Database (SQLite via Drizzle ORM)

- [x] 13 tables:
  - [x] `areas` — id, name (unique), color (default #6366f1), description, github_repo, created_at
  - [x] `tasks` — id, title, description, priority (critical/high/medium/low), status (todo/in-progress/done), area_id (FK areas, ON DELETE SET NULL), due_date, github_issue_url, github_issue_number, created_at, updated_at
  - [x] `bookmarks` — id, title, url, description, area_id (FK areas), created_at, updated_at
  - [x] `notes` — id, title, content, area_id (FK areas), created_at, updated_at
  - [x] `tags` — id, name (unique)
  - [x] `item_tags` — polymorphic join: id, item_id, item_type (task/bookmark/note), tag_id (FK tags ON DELETE CASCADE)
  - [x] `chat_conversations` — id, title, created_at, updated_at
  - [x] `chat_messages` — id, conversation_id (FK, CASCADE), role (user/assistant/system/tool), content, tool_calls (JSON), created_at
  - [x] `recent_searches` — id, query, created_at
  - [x] `embeddings` — id, item_type, item_id, chunk_index, content_hash, embedding (BLOB), chunk_text, source_path, model, dimensions, created_at, updated_at
  - [x] `daily_logs` — id, date (unique), summary, created_at, updated_at
  - [x] `daily_entries` — id, log_id (FK daily_logs, CASCADE), text, is_highlight (boolean), task_id (FK tasks, SET NULL), created_at
  - [x] `embedding_config` — key/value store for current model/dimensions
- [x] FTS5 virtual table `search_index` (title, content, item_type UNINDEXED, item_id UNINDEXED) with Porter tokenizer
- [x] Triggers to keep FTS5 in sync on INSERT/UPDATE/DELETE of tasks, bookmarks, and notes
- [x] WAL mode and foreign keys enabled on connection
- [x] Auto-create the `data/` directory

## API Routes (all under `/api`)

- [x] `tasks`: GET / (filters: areaId, priority, status, dueBefore, dueAfter, tagIds, sort, order), GET /counts, GET /:id, POST /, PATCH /:id, DELETE /:id
- [x] `areas`: GET /, GET /:id (with task/bookmark/note counts), POST /, PATCH /:id, DELETE /:id
- [x] `bookmarks`: GET / (filters: areaId, tagIds, sort, order), GET /:id, POST /, PATCH /:id, DELETE /:id
- [x] `notes`: GET / (filters), GET /:id, POST /, PATCH /:id, DELETE /:id
- [x] `tags`: GET /, POST /, DELETE /:id
- [x] `search`: GET / (FTS5 search, params: q, type), GET /recent, POST /recent
- [x] `docs`: GET / (recursively scan docs/ directory for .md/.pdf/.png files), GET /content?path=PATH
- [/] `github`: GET /issues?repo=OWNER/REPO, POST /create-issue, POST /link-issue (uses GITHUB_TOKEN env var, supports GITHUB_API_URL for GitHub Enterprise)
- [/] `chat`: GET /health, GET /conversations, POST /conversations, GET /conversations/:id/messages, DELETE /conversations/:id, POST /conversations/:id/messages (SSE streaming via Ollama)
- [/] `ai`: GET /status, POST /similar-tasks, POST /categorize, POST /summary, POST /reindex
- [x] `daily-log`: GET /today, GET /list, GET /:date, POST /:date/entries, PATCH /entries/:id, DELETE /entries/:id, GET /:date/highlights
- [x] `dashboard` (inline): GET / — aggregated stats (total open tasks, overdue, due this week, bookmark count), tasks by area with open/in-progress counts, overdue tasks, upcoming deadlines, recent items across all types

## Frontend Pages

- [x] Dashboard — stat cards, overdue tasks, upcoming deadlines, tasks by area breakdown, recent activity, today's highlights, AI work summary button
- [x] Tasks — status tabs (All/Todo/In Progress/Done with counts), filters (area, priority, tag, date range), sortable table, inline create/edit form, GitHub issue modal (create or link), AI auto-categorize button, similar task suggestions
- [x] Bookmarks — list with area/tag filters, create/edit form
- [x] Notes — list with area/tag filters, create/edit form with markdown content
- [x] Areas — CRUD with color picker, shows item counts per area
- [x] Area Detail — single area view showing all its tasks, bookmarks, notes
- [x] Docs — file tree browser for docs/ directory, renders markdown with react-markdown
- [x] Search — full-text search results page, triggered from header search bar (Ctrl+K shortcut)
- [x] Daily Log — date-based work log with entries, highlight toggle, optional task linking

## Layout

- [x] Sidebar: navigation links + dynamically loaded area list from DB (each area is a link to its detail page)
- [x] Header: search bar with Ctrl+K focus, theme toggle (dark/light with class-based Tailwind), chat toggle button
- [/] Chat Panel: slide-out panel from right. Shows conversation tabs, message bubbles with markdown rendering, streaming "Thinking..." indicator, tool execution indicators, quick action buttons ("What's overdue?", "Summarize my week", etc.)

## AI/RAG System (all via Ollama, gracefully degrades if unavailable)

- [/] Ollama Integration
  - [/] Auto-detect Ollama host: check OLLAMA_HOST env, try WSL gateway detection (parse /etc/resolv.conf for nameserver IP, probe that IP on port 11434), fall back to localhost:11434
  - [/] Chat model priority: llama3.1 > llama3.2 > llama3 > mistral > gemma2 > phi3 > codellama > qwen2 > deepseek
  - [/] Embedding model priority: nomic-embed-text > mxbai-embed-large > all-minilm > snowflake-arctic-embed
- [/] RAG Pipeline
  - [/] Chunker: split markdown by ## and ### headings, max 1500 chars per chunk, min 50 chars, fallback to paragraph splitting
  - [/] Embeddings: generate via Ollama /api/embed, serialize Float32Array to Buffer for SQLite BLOB storage, SHA-256 content hashing for change detection
  - [/] Vector Store: SQLite-backed, brute-force cosine similarity search (load all embeddings of matching types, compute in-memory), configurable topK and min score threshold (0.3)
  - [/] Indexing: on startup detect model and index all items. Reindex every 5 minutes. Index tasks, notes, bookmarks, and all markdown docs. Skip unchanged items (by content hash). Clean up stale embeddings. Detect model changes and trigger full re-index.
  - [/] Context Builder: build system prompt with live DB stats (task counts, areas, overdue tasks, in-progress tasks, recent notes/bookmarks) + RAG semantic search results for the user's query
- [/] Chat Tools (available to the LLM via function calling)
  - [/] 10 tools: create_task, update_task_status, create_note, create_bookmark, search_items (FTS5), get_overdue_tasks, get_tasks_by_area, summarize_progress, semantic_search (RAG), generate_work_summary
- [/] AI Suggestions
  - [/] Similar tasks: use embeddings (cosine similarity) or fallback to FTS5
  - [/] Auto-categorize: send task title/description to LLM with available areas and tags, return suggested area, tags, priority as JSON
  - [/] Work summary: query completed/in-progress tasks for a period, send to LLM for standup-style summary

## Theming

- [x] Dark/light mode via Tailwind's class strategy
- [x] HSL CSS custom properties for all colors (shadcn/ui pattern)
- [x] Inline script in index.html applies dark class before React hydrates to prevent flash

## Environment Variables

- [/] GITHUB_TOKEN — PAT for GitHub features (server-side only)
- [/] GITHUB_API_URL — base URL for GitHub Enterprise
- [/] OLLAMA_HOST — Ollama endpoint (auto-detected if not set)
- [x] PORT / API_PORT — Express port (default 3001)
- [x] VITE_PORT — Vite dev port (default 5173)
- [/] REINDEX_INTERVAL_MS — RAG reindex interval (default 300000)

## NPM Scripts

- [x] `dev`: concurrently run server (tsx watch) + client (vite)
- [x] `dev:server`: tsx watch server/index.ts
- [x] `dev:client`: vite
- [x] `build`: tsc && vite build
- [x] `db:push`: drizzle-kit push
- [x] `db:seed`: seed 7 default areas
- [x] `start`: node dist/server/index.js

## Key Design Decisions

- [x] SQLite is the single data store for relational data, full-text search (FTS5), AND vector embeddings — no external vector DB needed
- [x] Polymorphic tagging via item_tags table with item_type discriminator
- [x] All AI features are optional and the app fully works without Ollama
- [x] WSL-aware Ollama host detection for Windows/WSL development
- [x] Chat LLM has direct DB access via tool calling (not through HTTP routes)
- [x] Data directory (`data/`) is separate from code (`tool/`) so upgrades don't affect user data
- [x] Docs directory (`docs/`) is scanned at runtime and rendered in-app as a documentation browser
