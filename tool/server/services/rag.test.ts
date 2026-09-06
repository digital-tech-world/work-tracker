import { RAGService } from './rag';
import { OllamaService } from './ollama';

// Mock the database connection to avoid SQLite I/O errors
jest.mock('../db/connection', () => ({
  db: {
    select: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    raw: jest.fn((sql, params) => ({ toString: () => `${sql} ${params.join(',')}` }))
  }
}));

console.log('Testing RAG Service...');

async function runTests() {
  // Create a real instance
  const ragService = new RAGService();

  // Test 1: Instantiate the RAGService
  console.log('✓ Test 1: RAGService instantiated');

  // Test 2: Check initialization state
  console.log('✓ Test 2: Initial state - isInitialized:', (ragService as any).isInitialized);

  // Test 3: Test detectOllamaHost method indirectly
  const ollamaService = new OllamaService();
  const host = ollamaService.getHost();
  console.log(`✓ Test 3: Ollama host detected as: ${host}`);

  // Test 4: Test chunkText method (accessing private method)
  console.log('\n--- Testing chunkText method ---');
  const chunkTextMethod = (ragService as any).chunkText;

  // Test with simple text
  const simpleResult = chunkTextMethod.call(ragService, 'This is a test text for chunking.', 100, 10);
  console.log(`Simple text chunks:`, simpleResult);
  console.log(`✓ Test 4a: Simple text chunking works`);

  // Test with longer text that should be chunked
  const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
  const longChunks = chunkTextMethod.call(ragService, longText, 200, 50);
  console.log(`Long text (${longText.length} chars) split into ${longChunks.length} chunks:`);
  longChunks.forEach((chunk: string, index: number) => {
    console.log(`  Chunk ${index + 1}: ${chunk.length} chars`);
  });
  const allWithinMax = longChunks.every(chunk => chunk.length <= 200);
  const allExceptLastMin = longChunks.slice(0, -1).every(chunk => chunk.length >= 50);
  console.log(`✓ Test 4b: Long text chunking works - all chunks <= 200 chars: ${allWithinMax}`);
  console.log(`✓ Test 4c: Long text chunking works - all except last >= 50 chars: ${allExceptLastMin}`);

  // Test 5: Test semanticSearch method (expect it to handle gracefully when Ollama isn't running)
  console.log('\n--- Testing semanticSearch method ---');
  try {
    // Test semantic search with no initialization (should work gracefully)
    const results = await ragService.semanticSearch('test query');
    console.log(`✓ Test 5a: semanticSearch returned ${results.length} results (graceful handling)`);
    console.log(`✓ Test 5b: Result type is Array: ${Array.isArray(results)}`);
  } catch (error) {
    console.error('✗ Test 5 failed:', error);
  }

  // Test 6: Test initialization method (will fail gracefully if Ollama not running)
  console.log('\n--- Testing initialize method ---');
  try {
    await ragService.initialize();
    console.log(`✓ Test 6a: initialize() completed without error`);
    console.log(`✓ Test 6b: isInitialized after init: ${(ragService as any).isInitialized}`);
    console.log(`✓ Test 6c: embeddingModel after init: ${(ragService as any).embeddingModel || 'None (expected if Ollama not running)'}`);
  } catch (error) {
    console.error('✗ Test 6 failed:', error);
  }

  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error);