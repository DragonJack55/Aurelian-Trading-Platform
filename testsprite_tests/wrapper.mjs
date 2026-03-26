import { spawn } from 'node:child_process';
import process from 'node:process';

// Wrapper to filter out non-JSON noise from TestSprite MCP server stdout
const cp = spawn('node', ['./node_modules/.bin/testsprite-mcp-plugin', 'server'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, API_KEY: process.env.TESTSPRITE_API_KEY }
});

cp.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  // Only forward lines that look like JSON (starting with {)
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('{')) {
      process.stdout.write(line + '\n');
    }
  }
});

process.stdin.on('data', (data) => {
  cp.stdin.write(data);
});

cp.on('exit', (code) => {
  process.exit(code ?? 0);
});
