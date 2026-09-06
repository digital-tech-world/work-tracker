"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ollama_1 = require("./ollama");
// Test script for OllamaService
async function testOllamaService() {
    console.log('Testing OllamaService...');
    console.log('='.repeat(50));
    // 1. Instantiate the OllamaService
    console.log('1. Instantiating OllamaService...');
    const ollamaService = new ollama_1.OllamaService();
    console.log(`   Host detected: ${ollamaService.getHost()}`);
    // 2. Test detectOllamaHost method (indirectly through constructor)
    console.log('\n2. Testing detectOllamaHost method...');
    // The host detection happened in constructor
    const host = ollamaService.getHost();
    console.log(`   Detected host: ${host}`);
    console.log(`   Host is valid: ${host.startsWith('http')}`);
    // 3. Test listModels method
    console.log('\n3. Testing listModels method...');
    try {
        const models = await ollamaService.listModels();
        console.log(`   Found ${models.length} models`);
        if (models.length > 0) {
            console.log('   First few models:', models.slice(0, 3).map(m => m.name));
        }
        else {
            console.log('   No models found (Ollama may not be running)');
        }
    }
    catch (error) {
        console.log('   Error calling listModels (expected if Ollama not running):');
        console.log(`   ${error.message}`);
    }
    // 4. Test isModelAvailable method
    console.log('\n4. Testing isModelAvailable method...');
    const testModel = 'llama3.1';
    try {
        const isAvailable = await ollamaService.isModelAvailable(testModel);
        console.log(`   Is '${testModel}' available? ${isAvailable}`);
    }
    catch (error) {
        console.log('   Error calling isModelAvailable:');
        console.log(`   ${error.message}`);
    }
    // Test with another model
    const testModel2 = 'nochemodel';
    try {
        const isAvailable = await ollamaService.isModelAvailable(testModel2);
        console.log(`   Is '${testModel2}' available? ${isAvailable}`);
    }
    catch (error) {
        console.log('   Error calling isModelAvailable for non-existent model:');
        console.log(`   ${error.message}`);
    }
    console.log('\n' + '='.repeat(50));
    console.log('Test completed!');
}
// Run the test
testOllamaService().catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
});
