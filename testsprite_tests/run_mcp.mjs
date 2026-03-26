import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  console.log("Starting TestSprite MCP Client...");
  
  const transport = new StdioClientTransport({
    command: "node",
    args: ["./testsprite_tests/wrapper.mjs"],
    env: { ...process.env, TESTSPRITE_API_KEY: "sk-user-7qO6TwvHxuwfxOfZb_Bgc3mb7NR_G4VC1-pjDHa_kYLJLdBgQSLCgVktUO-J4hnyEssnaj2VVrUGqhCFsJZScZTsBsFpNH6WP4X13PFRxk-mwsCRyt_8dXSXcEpR9tknNTc" }
  });

  const client = new Client(
    { name: "testsprite-runner", version: "1.0.0" },
    { capabilities: {} }
  );
  
  try {
    await client.connect(transport);
    console.log("Connected to MCP server!");
    
    console.log("Checking account info...");
    const accountInfo = await client.callTool({
      name: "testsprite_check_account_info",
      arguments: {}
    });
    console.log("Account Info:", JSON.stringify(accountInfo, null, 2));
    
    const tools = await client.listTools();
    console.log("Available tools:", tools.tools.map(t => t.name));
    
    if (tools.tools.find(t => t.name === "testsprite_generate_code_and_execute")) {
      console.log("Submitting project to TestSprite...");
      const result = await client.callTool({
        name: "testsprite_generate_code_and_execute",
        arguments: {
          projectCommand: "npm run build",
          projectPath: "/Users/jack/Documents/Aurelian_Trading_Platform",
          testInstruction: "Test the React website for any UI or logic errors. Pay special attention to the new 'iPhone 17 Pro Max' hero mockup (orange metallic frame) and the 3D orbital animations (Bitcoin/Euro/Yen/Gold Bar spinning around the phone). Ensure elements stay properly aligned on mobile and desktop.",
          projectContext: "Aurelian Trading Platform React App using Firebase Auth and Firestore. Recently upgraded with high-fidelity CSS phone mockup and 3D orbital path animations."
        }
      }, undefined, { timeout: 1200000 }); // 20 minute timeout
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
