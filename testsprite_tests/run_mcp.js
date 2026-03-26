const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

async function main() {
  console.log("Starting TestSprite MCP Client...");
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@testsprite/testsprite-mcp@latest", "server"],
    env: { ...process.env, TESTSPRITE_API_KEY: "sk-user-jDsf9rSV-Xtkietbmo2BdQmf3i1iHp5LRpcdmeCIHVpr-EmVtv297VEVSUObCGObXWLsSAH9c0MUTHPLTYNOWML1-peDrHSKf23p3W7pU7Ri1ZQnvQvM4aJQMwuaxPyEbxs" }
  });

  const client = new Client({ name: "testsprite-runner", version: "1.0.0" }, { capabilities: {} });
  
  try {
    await client.connect(transport);
    console.log("Connected to MCP server!");
    
    // Get available tools
    const tools = await client.listTools();
    console.log("Available tools:", tools.tools.map(t => t.name));
    
    // Call the testsprite testing tool
    if (tools.tools.find(t => t.name === "testsprite_generate_code_and_execute")) {
      console.log("Submitting project to TestSprite...");
      const result = await client.callTool({
        name: "testsprite_generate_code_and_execute",
        arguments: {
          projectCommand: "npm run build",
          projectPath: "/Users/jack/Documents/Aurelian_Trading_Platform",
          testInstruction: "Test the React website for any UI or logic errors",
          projectContext: "Aurelian Trading Platform React App"
        }
      });
      console.log("Test execution result:", JSON.stringify(result, null, 2));
    } else {
      console.error("Tool testsprite_generate_code_and_execute not found!");
    }
  } catch (error) {
    console.error("Error calling MCP server:", error);
  } finally {
    process.exit(0);
  }
}

main();
