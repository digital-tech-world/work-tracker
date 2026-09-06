import { Ollama } from 'ollama';

// Ollama service for handling Ollama integration
export class OllamaService {
  private client: Ollama;
  private host: string;

  constructor() {
    // Auto-detect Ollama host
    this.host = this.detectOllamaHost();
    this.client = new Ollama({ host: this.host });
  }

  private detectOllamaHost(): string {
    // Check OLLAMA_HOST environment variable first
    if (process.env.OLLAMA_HOST) {
      return process.env.OLLAMA_HOST;
    }

    // Try WSL gateway detection (parse /etc/resolv.conf for nameserver IP)
    try {
      const fs = require('fs');
      const os = require('os');

      if (os.platform() === 'linux' && fs.existsSync('/etc/resolv.conf')) {
        const resolvConf = fs.readFileSync('/etc/resolv.conf', 'utf8');
        const nameserverMatch = resolvConf.match(/nameserver\s+(\d+\.\d+\.\d+\.\d+)/);
        if (nameserverMatch) {
          const nameserverIp = nameserverMatch[1];
          // Probe nameserver IP on port 11434
          // In a real implementation, we would actually probe this
          // For now, we'll return it if it looks like a WSL gateway
          if (nameserverIp.startsWith('172.') || nameserverIp.startsWith('192.168.')) {
            return `http://${nameserverIp}:11434`;
          }
        }
      }
    } catch (error) {
      // Ignore errors in detection and fall back to localhost
    }

    // Fall back to localhost
    return 'http://localhost:11434';
  }

  // Get available models
  async listModels(): Promise<any[]> {
    try {
      const response = await this.client.list();
      return response.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  // Check if a model is available
  async isModelAvailable(modelName: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.some(model => model.name.includes(modelName));
    } catch (error) {
      return false;
    }
  }

  // Generate chat completion
  async generateChat(
    model: string,
    messages: any[],
    options: any = {}
  ): Promise<any> {
    try {
      return await this.client.chat({
        model,
        messages,
        stream: false,
        ...options
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate chat completion: ${message}`);
    }
  }

  // Generate embeddings
  async generateEmbeddings(
    model: string,
    prompt: string
  ): Promise<number[]> {
    try {
      const response = await this.client.embed({
        model,
        input: prompt
      });
      return response.embeddings[0];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate embeddings: ${message}`);
    }
  }

  // Get the Ollama host
  getHost(): string {
    return this.host;
  }
}

// Model priorities from GOAL.md
export const CHAT_MODEL_PRIORITY = [
  'llama3.1',
  'llama3.2',
  'llama3',
  'mistral',
  'gemma2',
  'phi3',
  'codellama',
  'qwen2',
  'deepseek'
];

export const EMBEDDING_MODEL_PRIORITY = [
  'nomic-embed-text',
  'mxbai-embed-large',
  'all-minilm',
  'snowflake-arctic-embed'
];

// Helper function to select the best available model from a priority list
export async function selectBestAvailableModel(
  ollamaService: OllamaService,
  priorityList: string[]
): Promise<string | null> {
  for (const model of priorityList) {
    if (await ollamaService.isModelAvailable(model)) {
      return model;
    }
  }
  return null;
}

export default new OllamaService();