// Simple syntax test for our ConnectionStatus component
const fs = require('fs');
const path = require('path');

try {
  // Test ConnectionStatus.js
  const connectionStatusPath = path.join(__dirname, 'frontend', 'src', 'components', 'ConnectionStatus.js');
  const connectionStatusContent = fs.readFileSync(connectionStatusPath, 'utf8');

  // Test AuthPrompt.js
  const authPromptPath = path.join(__dirname, 'frontend', 'src', 'components', 'AuthPrompt.js');
  const authPromptContent = fs.readFileSync(authPromptPath, 'utf8');

  console.log('Files read successfully');
  console.log('ConnectionStatus.js size:', connectionStatusContent.length, 'chars');
  console.log('AuthPrompt.js size:', authPromptContent.length, 'chars');

  // Try to parse as JavaScript (basic check)
  // This won't execute React but will catch syntax errors
  const vm = require('vm');

  // Wrap in a function to avoid top-level await/issues
  const wrappedConnectionStatus = `(function() { ${connectionStatusContent} })();`;
  const wrappedAuthPrompt = `(function() { ${authPromptContent} })();`;

  // These will throw if there are syntax errors
  vm.runInThisContext(wrappedConnectionStatus);
  vm.runInThisContext(wrappedAuthPrompt);

  console.log('Syntax check passed for both files!');
} catch (error) {
  console.error('Syntax check failed:', error.message);
  process.exit(1);
}