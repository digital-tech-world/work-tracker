// @ts-nocheck
import { db } from '../db/connection';
import { embeddings, embeddingConfig, tasks, bookmarks, notes } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { OllamaService, selectBestAvailableModel, EMBEDDING_MODEL_PRIORITY } from './ollama';
import { sha256 } from 'js-sha256';

// RAG service for handling embeddings and semantic search
export class RAGService {
  private ollamaService: OllamaService;
  private embeddingModel: string | null = null;
  private embeddingDimensions: number = 384; // Default for all-minilm
  private reindexInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  // Initialize the RAG service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Select the best available embedding model
      this.embeddingModel = await selectBestAvailableModel(
        this.ollamaService,
        EMBEDDING_MODEL_PRIORITY
      );

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
    } catch (error) {
      console.error('Failed to initialize RAG service:', error);
    }
  }

  // Ensure embedding config exists in the database
  private async ensureEmbeddingConfig(): Promise<void> {
    const [config] = await db.select().from(embeddingConfig).where(eq(embeddingConfig.key, 'currentModel'));

    if (!config) {
      await db.insert(embeddingConfig).values({
        key: 'currentModel',
        value: this.embeddingModel || ''
      });
    } else if (config.value !== this.embeddingModel) {
      // Model has changed, trigger reindex
      await db.update(embeddingConfig)
        .set({ value: this.embeddingModel || '' })
        .where(eq(embeddingConfig.key, 'currentModel'));

      // Trigger reindex for all item types
      await this.reindexAll();
    }
  }

  // Start periodic reindexing based on environment variable or default (5 minutes)
  private startReindexing(): void {
    const intervalMs = parseInt(process.env.REINDEX_INTERVAL_MS || '300000', 10); // 5 minutes default

    if (this.reindexInterval) {
      clearInterval(this.reindexInterval);
    }

    this.reindexInterval = setInterval(async () => {
      try {
        await this.reindexAll();
      } catch (error) {
        console.error('Error during periodic reindexing:', error);
      }
    }, intervalMs);
  }

  // Stop periodic reindexing
  stopReindexing(): void {
    if (this.reindexInterval) {
      clearInterval(this.reindexInterval);
      this.reindexInterval = null;
    }
  }

  // Generate content hash for change detection
  private generateContentHash(content: string): string {
    return sha256(content);
  }

  // Chunk text by headings (## and ###) with fallback to paragraph splitting
  private chunkText(text: string, maxChars = 1500, minChars = 50): string[] {
    if (!text.trim()) return [];

    // Split by headings (## and ###)
    const headingSplit = text.split(/^(#{2,3}\s+.*)/gm);
    let chunks: string[] = [];
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
      } else {
        // If adding this part would exceed maxChars, save current chunk and start new one
        if ((currentChunk + part).length > maxChars && currentChunk.length >= minChars) {
          chunks.push(currentChunk.trim());
          currentChunk = part;
        } else {
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
        } else {
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
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingModel) {
      throw new Error('No embedding model available');
    }

    return await this.ollamaService.generateEmbeddings(this.embeddingModel, text);
  }

  // Index a single item (task, bookmark, note, or doc)
  async indexItem(
    itemType: 'task' | 'bookmark' | 'note' | 'doc',
    itemId: number,
    title: string,
    content: string,
    sourcePath: string = ''
  ): Promise<void> {
    if (!this.embeddingModel) return;

    try {
      // Generate content hash for change detection
      const contentHash = this.generateContentHash(`${title}\n\n${content}`);

      // Check if we already have an embedding for this item with the same hash
      const [existing] = await db.select()
        .from(embeddings)
        .where(
          and(
            eq(embeddings.itemType, itemType),
            eq(embeddings.itemId, itemId),
            eq(embeddings.contentHash, contentHash)
          )
        );

      if (existing) {
        // Embedding is up to date
        return;
      }

      // Delete old embeddings for this item (if any)
      await db.delete(embeddings)
        .where(
          and(
            eq(embeddings.itemType, itemType),
            eq(embeddings.itemId, itemId)
          )
        );

      // Chunk the content
      const chunks = this.chunkText(content);

      if (chunks.length === 0) {
        // If no chunks, index the title only
        const titleChunks = this.chunkText(title, 500, 10); // Smaller chunks for title
        if (titleChunks.length === 0) return;

        for (let i = 0; i < titleChunks.length; i++) {
          const embedding = await this.generateEmbedding(titleChunks[i]);
          await db.insert(embeddings).values({
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
        await db.insert(embeddings).values({
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
    } catch (error) {
      console.error(`Failed to index ${itemType} ${itemId}:`, error);
    }
  }

  // Reindex all items of a specific type
  async reindexItemType(itemType: 'task' | 'bookmark' | 'note' | 'doc'): Promise<void> {
    if (!this.embeddingModel) return;

    try {
      let items: any[] = [];

      switch (itemType) {
        case 'task':
          items = await db.select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description
          }).from(tasks);
          break;
        case 'bookmark':
          items = await db.select({
            id: bookmarks.id,
            title: bookmarks.title,
            description: bookmarks.description
          }).from(bookmarks);
          break;
        case 'note':
          items = await db.select({
            id: notes.id,
            title: notes.title,
            content: notes.content
          }).from(notes);
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

        await this.indexItem(
          itemType,
          item.id,
          item.title,
          content
        );
      }

      console.log(`Reindexed ${items.length} ${itemType}(s)`);
    } catch (error) {
      console.error(`Failed to reindex ${itemType}:`, error);
    }
  }

  // Reindex all items
  async reindexAll(): Promise<void> {
    if (!this.embeddingModel) return;

    try {
      console.log('Starting full reindex...');
      await this.reindexItemType('task');
      await this.reindexItemType('bookmark');
      await this.reindexItemType('note');
      await this.reindexDocs();
      console.log('Full reindex completed');
    } catch (error) {
      console.error('Failed to reindex all items:', error);
    }
  }

  // Reindex documentation files
  private async reindexDocs(): Promise<void> {
    if (!this.embeddingModel) return;

    try {
      const fs = await import('fs');
      const path = await import('path');

      const docsDir = path.join(process.cwd(), 'docs');

      if (!fs.existsSync(docsDir)) {
        return;
      }

      const processFile = (filePath: string): void => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext !== '.md' && ext !== '.txt') return;

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(docsDir, filePath);

          // Use a hash of the file path as item ID for docs
          const itemId = parseInt(sha256(relativePath).slice(0, 8), 16) % 1000000;

          this.indexItem('doc', itemId, path.basename(filePath), content, relativePath);
        } catch (error) {
          console.error(`Failed to process doc file ${filePath}:`, error);
        }
      };

      // Walk the docs directory
      const walkDir = (dir: string): void => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else {
            processFile(fullPath);
          }
        }
      };

      walkDir(docsDir);
    } catch (error) {
      console.error('Failed to reindex docs:', error);
    }
  }

  // Perform semantic search
  async semanticSearch(
    query: string,
    itemTypes: ('task' | 'bookmark' | 'note' | 'doc')[] = ['task', 'bookmark', 'note', 'doc'],
    topK: number = 5,
    minScore: number = 0.3
  ): Promise<Array<{
    id: number;
    title: string;
    content: string;
    type: 'task' | 'bookmark' | 'note' | 'doc';
    score: number;
    areaId: number | null;
  }>> {
    if (!this.embeddingModel || !this.isInitialized) {
      // Fall back to FTS5 search if RAG is not available
      return this.fallbackFts5Search(query, itemTypes, topK);
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      const queryVector = Float32Array.from(queryEmbedding);

      // Get all embeddings of the specified types
      const embeddingsRows = await db.select({
        id: embeddings.id,
        itemType: embeddings.itemType,
        itemId: embeddings.itemId,
        chunkText: embeddings.chunkText,
        embedding: embeddings.embedding,
        contentHash: embeddings.contentHash
      })
      .where(sql`${embeddings.itemType} IN (${itemTypes.map(() => '?').join(',')})`,
             [...itemTypes]);

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
      const bestChunks = new Map<string, {
        itemType: 'task' | 'bookmark' | 'note' | 'doc';
        itemId: number;
        title: string;
        content: string;
        score: number;
        areaId: number | null;
      }>();

      for (const similarity of similarities) {
        const key = `${similarity.itemType}:${similarity.itemId}`;
        if (!bestChunks.has(key) || similarity.similarity > bestChunks.get(key)!.score) {
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
      const results: Array<{
        id: number;
        title: string;
        content: string;
        type: 'task' | 'bookmark' | 'note' | 'doc';
        score: number;
        areaId: number | null;
      }> = [];

      for (const [, chunkInfo] of bestChunks) {
        if (results.length >= topK) break;

        if (chunkInfo.score < minScore) continue;

        let itemInfo: any = null;
        switch (chunkInfo.itemType) {
          case 'task':
            itemInfo = await db.select({
              id: tasks.id,
              title: tasks.title,
              areaId: tasks.areaId
            })
            .from(tasks)
            .where(eq(tasks.id, chunkInfo.itemId))
            .limit(1);
            break;
          case 'bookmark':
            itemInfo = await db.select({
              id: bookmarks.id,
              title: bookmarks.title,
              areaId: bookmarks.areaId
            })
            .from(bookmarks)
            .where(eq(bookmarks.id, chunkInfo.itemId))
            .limit(1);
            break;
          case 'note':
            itemInfo = await db.select({
              id: notes.id,
              title: notes.title,
              areaId: notes.areaId
            })
            .from(notes)
            .where(eq(notes.id, chunkInfo.itemId))
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
    } catch (error) {
      console.error('Semantic search failed, falling back to FTS5:', error);
      return this.fallbackFts5Search(query, itemTypes, topK);
    }
  }

  // Fallback to FTS5 search when RAG is not available
  private async fallbackFts5Search(
    query: string,
    itemTypes: ('task' | 'bookmark' | 'note' | 'doc')[],
    topK: number
  ): Promise<Array<{
    id: number;
    title: string;
    content: string;
    type: 'task' | 'bookmark' | 'note' | 'doc';
    score: number;
    areaId: number | null;
  }>> {
    try {
      // Map item types to FTS5 item_type values
      const typeMap: Record<string, string> = {
        'task': 'task',
        'bookmark': 'bookmark',
        'note': 'note',
        'doc': 'doc'
      };

      const fts5Types = itemTypes.map(type => typeMap[type]).filter(Boolean);

      let queryBuilder = db.select({
        id: db.raw<string>(`search_index.rowid`),
        title: db.raw<string>(`search_index.title`),
        content: db.raw<string>(`search_index.content`),
        item_type: db.raw<string>(`search_index.item_type`),
        item_id: db.raw<number>(`search_index.rowid`)
      })
      .from(db.raw('search_index'))
      .where(db.raw('search_index MATCH ?', [query]));

      if (fts5Types.length > 0) {
        const placeholders = fts5Types.map(() => '?').join(',');
        queryBuilder = queryBuilder.where(
          db.raw(`search_index.item_type IN (${placeholders})`),
          [...fts5Types]
        );
      }

      const results = await queryBuilder.limit(topK);

      return results.map(row => ({
        id: row.item_id,
        title: row.title,
        content: row.content,
        type: row.item_type as 'task' | 'bookmark' | 'note' | 'doc',
        score: 0.8, // Fixed score for fallback
        areaId: null // Would need to join with respective tables
      }));
    } catch (error) {
      console.error('FTS5 search also failed:', error);
      return [];
    }
  }
}

// Export a singleton instance
const ragService = new RAGService();
export default ragService;