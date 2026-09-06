"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGService = void 0;
// @ts-nocheck
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const ollama_1 = require("./ollama");
const js_sha256_1 = require("js-sha256");
// RAG service for handling embeddings and semantic search
class RAGService {
    constructor() {
        this.embeddingModel = null;
        this.embeddingDimensions = 384; // Default for all-minilm
        this.reindexInterval = null;
        this.isInitialized = false;
        this.ollamaService = new ollama_1.OllamaService();
    }
    // Initialize the RAG service
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            // Select the best available embedding model
            this.embeddingModel = await (0, ollama_1.selectBestAvailableModel)(this.ollamaService, ollama_1.EMBEDDING_MODEL_PRIORITY);
            if (!this.embeddingModel) {
                console.warn('No embedding model available. RAG features will be disabled.');
                return;
            }
            // Get model dimensions (we'll assume a default for now, could query Ollama API)
            switch (this.embeddingModel) {
                case 'nomic-embed-text':
                    this.embeddingDimensions = 768;
                    break;
                case 'mxbai-embed-large':
                    this.embeddingDimensions = 1024;
                    break;
                case 'all-minilm':
                    this.embeddingDimensions = 384;
                    break;
                case 'snowflake-arctic-embed':
                    this.embeddingDimensions = 768;
                    break;
                default:
                    this.embeddingDimensions = 384; // Default fallback
            }
            // Ensure embedding config exists
            await this.ensureEmbeddingConfig();
            // Start periodic reindexing
            this.startReindexing();
            this.isInitialized = true;
            console.log(`RAG service initialized with model: ${this.embeddingModel} (${this.embeddingDimensions} dimensions)`);
        }
        catch (error) {
            console.error('Failed to initialize RAG service:', error);
        }
    }
    // Ensure embedding config exists in the database
    async ensureEmbeddingConfig() {
        const [config] = await connection_1.db.select().from(schema_1.embeddingConfig).where((0, drizzle_orm_1.eq)(schema_1.embeddingConfig.key, 'currentModel'));
        if (!config) {
            await connection_1.db.insert(schema_1.embeddingConfig).values({
                key: 'currentModel',
                value: this.embeddingModel || ''
            });
        }
        else if (config.value !== this.embeddingModel) {
            // Model has changed, trigger reindex
            await connection_1.db.update(schema_1.embeddingConfig)
                .set({ value: this.embeddingModel || '' })
                .where((0, drizzle_orm_1.eq)(schema_1.embeddingConfig.key, 'currentModel'));
            // Trigger reindex for all item types
            await this.reindexAll();
        }
    }
    // Start periodic reindexing based on environment variable or default (5 minutes)
    startReindexing() {
        const intervalMs = parseInt(process.env.REINDEX_INTERVAL_MS || '300000', 10); // 5 minutes default
        if (this.reindexInterval) {
            clearInterval(this.reindexInterval);
        }
        this.reindexInterval = setInterval(async () => {
            try {
                await this.reindexAll();
            }
            catch (error) {
                console.error('Error during periodic reindexing:', error);
            }
        }, intervalMs);
    }
    // Stop periodic reindexing
    stopReindexing() {
        if (this.reindexInterval) {
            clearInterval(this.reindexInterval);
            this.reindexInterval = null;
        }
    }
    // Generate content hash for change detection
    generateContentHash(content) {
        return (0, js_sha256_1.sha256)(content);
    }
    // Chunk text by headings (## and ###) with fallback to paragraph splitting
    chunkText(text, maxChars = 1500, minChars = 50) {
        if (!text.trim())
            return [];
        // Split by headings (## and ###)
        const headingSplit = text.split(/^(#{2,3}\s+.*)/gm);
        let chunks = [];
        let currentChunk = '';
        for (let i = 0; i < headingSplit.length; i++) {
            const part = headingSplit[i];
            // If this part is a heading, start a new chunk with it
            if (/^#{2,3}\s+/.test(part)) {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                currentChunk = part;
            }
            else {
                // If adding this part would exceed maxChars, save current chunk and start new one
                if ((currentChunk + part).length > maxChars && currentChunk.length >= minChars) {
                    chunks.push(currentChunk.trim());
                    currentChunk = part;
                }
                else {
                    currentChunk += part;
                }
            }
        }
        // Add the last chunk if it meets minimum length
        if (currentChunk.trim().length >= minChars) {
            chunks.push(currentChunk.trim());
        }
        // If no chunks were created from heading splitting, fall back to paragraph splitting
        if (chunks.length === 0) {
            const paragraphs = text.split(/\n\s*\n/);
            currentChunk = '';
            for (const paragraph of paragraphs) {
                if ((currentChunk + paragraph).length > maxChars && currentChunk.length >= minChars) {
                    chunks.push(currentChunk.trim());
                    currentChunk = paragraph;
                }
                else {
                    currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
                }
            }
            if (currentChunk.trim().length >= minChars) {
                chunks.push(currentChunk.trim());
            }
        }
        // If still no chunks, create one chunk from the entire text (if it meets min length)
        if (chunks.length === 0 && text.length >= minChars) {
            chunks.push(text.trim());
        }
        return chunks;
    }
    // Generate embedding for a text chunk
    async generateEmbedding(text) {
        if (!this.embeddingModel) {
            throw new Error('No embedding model available');
        }
        return await this.ollamaService.generateEmbeddings(this.embeddingModel, text);
    }
    // Index a single item (task, bookmark, note, or doc)
    async indexItem(itemType, itemId, title, content, sourcePath = '') {
        if (!this.embeddingModel)
            return;
        try {
            // Generate content hash for change detection
            const contentHash = this.generateContentHash(`${title}\n\n${content}`);
            // Check if we already have an embedding for this item with the same hash
            const [existing] = await connection_1.db.select()
                .from(schema_1.embeddings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.embeddings.itemType, itemType), (0, drizzle_orm_1.eq)(schema_1.embeddings.itemId, itemId), (0, drizzle_orm_1.eq)(schema_1.embeddings.contentHash, contentHash)));
            if (existing) {
                // Embedding is up to date
                return;
            }
            // Delete old embeddings for this item (if any)
            await connection_1.db.delete(schema_1.embeddings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.embeddings.itemType, itemType), (0, drizzle_orm_1.eq)(schema_1.embeddings.itemId, itemId)));
            // Chunk the content
            const chunks = this.chunkText(content);
            if (chunks.length === 0) {
                // If no chunks, index the title only
                const titleChunks = this.chunkText(title, 500, 10); // Smaller chunks for title
                if (titleChunks.length === 0)
                    return;
                for (let i = 0; i < titleChunks.length; i++) {
                    const embedding = await this.generateEmbedding(titleChunks[i]);
                    await connection_1.db.insert(schema_1.embeddings).values({
                        itemType,
                        itemId,
                        chunkIndex: i,
                        contentHash,
                        embedding: Float32Array.from(embedding),
                        chunkText: titleChunks[i],
                        sourcePath: sourcePath || null,
                        model: this.embeddingModel,
                        dimensions: this.embeddingDimensions
                    });
                }
                return;
            }
            // Index each chunk
            for (let i = 0; i < chunks.length; i++) {
                const embedding = await this.generateEmbedding(chunks[i]);
                await connection_1.db.insert(schema_1.embeddings).values({
                    itemType,
                    itemId,
                    chunkIndex: i,
                    contentHash,
                    embedding: Float32Array.from(embedding),
                    chunkText: chunks[i],
                    sourcePath: sourcePath || null,
                    model: this.embeddingModel,
                    dimensions: this.embeddingDimensions
                });
            }
        }
        catch (error) {
            console.error(`Failed to index ${itemType} ${itemId}:`, error);
        }
    }
    // Reindex all items of a specific type
    async reindexItemType(itemType) {
        if (!this.embeddingModel)
            return;
        try {
            let items = [];
            switch (itemType) {
                case 'task':
                    items = await connection_1.db.select({
                        id: schema_1.tasks.id,
                        title: schema_1.tasks.title,
                        description: schema_1.tasks.description
                    }).from(schema_1.tasks);
                    break;
                case 'bookmark':
                    items = await connection_1.db.select({
                        id: schema_1.bookmarks.id,
                        title: schema_1.bookmarks.title,
                        description: schema_1.bookmarks.description
                    }).from(schema_1.bookmarks);
                    break;
                case 'note':
                    items = await connection_1.db.select({
                        id: schema_1.notes.id,
                        title: schema_1.notes.title,
                        content: schema_1.notes.content
                    }).from(schema_1.notes);
                    break;
                case 'doc':
                    // For docs, we'll scan the docs directory
                    await this.reindexDocs();
                    return;
            }
            for (const item of items) {
                const content = itemType === 'task'
                    ? `${item.description || ''}`
                    : itemType === 'bookmark'
                        ? `${item.description || ''}`
                        : itemType === 'note'
                            ? `${item.content}`
                            : '';
                await this.indexItem(itemType, item.id, item.title, content);
            }
            console.log(`Reindexed ${items.length} ${itemType}(s)`);
        }
        catch (error) {
            console.error(`Failed to reindex ${itemType}:`, error);
        }
    }
    // Reindex all items
    async reindexAll() {
        if (!this.embeddingModel)
            return;
        try {
            console.log('Starting full reindex...');
            await this.reindexItemType('task');
            await this.reindexItemType('bookmark');
            await this.reindexItemType('note');
            await this.reindexDocs();
            console.log('Full reindex completed');
        }
        catch (error) {
            console.error('Failed to reindex all items:', error);
        }
    }
    // Reindex documentation files
    async reindexDocs() {
        if (!this.embeddingModel)
            return;
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            const docsDir = path.join(process.cwd(), 'docs');
            if (!fs.existsSync(docsDir)) {
                return;
            }
            const processFile = (filePath) => {
                const ext = path.extname(filePath).toLowerCase();
                if (ext !== '.md' && ext !== '.txt')
                    return;
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const relativePath = path.relative(docsDir, filePath);
                    // Use a hash of the file path as item ID for docs
                    const itemId = parseInt((0, js_sha256_1.sha256)(relativePath).slice(0, 8), 16) % 1000000;
                    this.indexItem('doc', itemId, path.basename(filePath), content, relativePath);
                }
                catch (error) {
                    console.error(`Failed to process doc file ${filePath}:`, error);
                }
            };
            // Walk the docs directory
            const walkDir = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        walkDir(fullPath);
                    }
                    else {
                        processFile(fullPath);
                    }
                }
            };
            walkDir(docsDir);
        }
        catch (error) {
            console.error('Failed to reindex docs:', error);
        }
    }
    // Perform semantic search
    async semanticSearch(query, itemTypes = ['task', 'bookmark', 'note', 'doc'], topK = 5, minScore = 0.3) {
        if (!this.embeddingModel || !this.isInitialized) {
            // Fall back to FTS5 search if RAG is not available
            return this.fallbackFts5Search(query, itemTypes, topK);
        }
        try {
            // Generate embedding for the query
            const queryEmbedding = await this.generateEmbedding(query);
            const queryVector = Float32Array.from(queryEmbedding);
            // Get all embeddings of the specified types
            const embeddingsRows = await connection_1.db.select({
                id: schema_1.embeddings.id,
                itemType: schema_1.embeddings.itemType,
                itemId: schema_1.embeddings.itemId,
                chunkText: schema_1.embeddings.chunkText,
                embedding: schema_1.embeddings.embedding,
                contentHash: schema_1.embeddings.contentHash
            })
                .where((0, drizzle_orm_1.sql) `${schema_1.embeddings.itemType} IN (${itemTypes.map(() => '?').join(',')})`, [...itemTypes]);
            if (embeddingsRows.length === 0) {
                return [];
            }
            // Calculate cosine similarity for each embedding
            const similarities = embeddingsRows.map(row => {
                // Convert Blob back to Float32Array
                const storedVector = new Float32Array(row.embedding);
                // Calculate dot product
                let dotProduct = 0;
                let normA = 0;
                let normB = 0;
                for (let i = 0; i < storedVector.length; i++) {
                    dotProduct += storedVector[i] * queryVector[i];
                    normA += storedVector[i] * storedVector[i];
                    normB += queryVector[i] * queryVector[i];
                }
                const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                return {
                    id: row.id,
                    itemType: row.itemType,
                    itemId: row.itemId,
                    chunkText: row.chunkText,
                    contentHash: row.contentHash,
                    similarity
                };
            });
            // Sort by similarity (descending)
            similarities.sort((a, b) => b.similarity - a.similarity);
            // Group by itemId to get the best chunk per item
            const bestChunks = new Map();
            for (const similarity of similarities) {
                const key = `${similarity.itemType}:${similarity.itemId}`;
                if (!bestChunks.has(key) || similarity.similarity > bestChunks.get(key).score) {
                    bestChunks.set(key, {
                        itemType: similarity.itemType,
                        itemId: similarity.itemId,
                        title: '', // Will fill in below
                        content: similarity.chunkText,
                        score: similarity.similarity,
                        areaId: null // Will fill in below
                    });
                }
            }
            // Fetch additional info for each item and limit results
            const results = [];
            for (const [, chunkInfo] of bestChunks) {
                if (results.length >= topK)
                    break;
                if (chunkInfo.score < minScore)
                    continue;
                let itemInfo = null;
                switch (chunkInfo.itemType) {
                    case 'task':
                        itemInfo = await connection_1.db.select({
                            id: schema_1.tasks.id,
                            title: schema_1.tasks.title,
                            areaId: schema_1.tasks.areaId
                        })
                            .from(schema_1.tasks)
                            .where((0, drizzle_orm_1.eq)(schema_1.tasks.id, chunkInfo.itemId))
                            .limit(1);
                        break;
                    case 'bookmark':
                        itemInfo = await connection_1.db.select({
                            id: schema_1.bookmarks.id,
                            title: schema_1.bookmarks.title,
                            areaId: schema_1.bookmarks.areaId
                        })
                            .from(schema_1.bookmarks)
                            .where((0, drizzle_orm_1.eq)(schema_1.bookmarks.id, chunkInfo.itemId))
                            .limit(1);
                        break;
                    case 'note':
                        itemInfo = await connection_1.db.select({
                            id: schema_1.notes.id,
                            title: schema_1.notes.title,
                            areaId: schema_1.notes.areaId
                        })
                            .from(schema_1.notes)
                            .where((0, drizzle_orm_1.eq)(schema_1.notes.id, chunkInfo.itemId))
                            .limit(1);
                        break;
                    case 'doc':
                        // For docs, we'll reconstruct from the chunk info
                        itemInfo = [{
                                id: chunkInfo.itemId,
                                title: chunkInfo.itemId.toString(), // Placeholder
                                areaId: null
                            }];
                        break;
                }
                if (itemInfo && itemInfo.length > 0) {
                    results.push({
                        id: itemInfo[0].id,
                        title: itemInfo[0].title,
                        content: chunkInfo.content,
                        type: chunkInfo.itemType,
                        score: chunkInfo.score,
                        areaId: itemInfo[0].areaId ?? null
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error('Semantic search failed, falling back to FTS5:', error);
            return this.fallbackFts5Search(query, itemTypes, topK);
        }
    }
    // Fallback to FTS5 search when RAG is not available
    async fallbackFts5Search(query, itemTypes, topK) {
        try {
            // Map item types to FTS5 item_type values
            const typeMap = {
                'task': 'task',
                'bookmark': 'bookmark',
                'note': 'note',
                'doc': 'doc'
            };
            const fts5Types = itemTypes.map(type => typeMap[type]).filter(Boolean);
            let queryBuilder = connection_1.db.select({
                id: connection_1.db.raw(`search_index.rowid`),
                title: connection_1.db.raw(`search_index.title`),
                content: connection_1.db.raw(`search_index.content`),
                item_type: connection_1.db.raw(`search_index.item_type`),
                item_id: connection_1.db.raw(`search_index.rowid`)
            })
                .from(connection_1.db.raw('search_index'))
                .where(connection_1.db.raw('search_index MATCH ?', [query]));
            if (fts5Types.length > 0) {
                const placeholders = fts5Types.map(() => '?').join(',');
                queryBuilder = queryBuilder.where(connection_1.db.raw(`search_index.item_type IN (${placeholders})`), [...fts5Types]);
            }
            const results = await queryBuilder.limit(topK);
            return results.map(row => ({
                id: row.item_id,
                title: row.title,
                content: row.content,
                type: row.item_type,
                score: 0.8, // Fixed score for fallback
                areaId: null // Would need to join with respective tables
            }));
        }
        catch (error) {
            console.error('FTS5 search also failed:', error);
            return [];
        }
    }
}
exports.RAGService = RAGService;
// Export a singleton instance
const ragService = new RAGService();
exports.default = ragService;
