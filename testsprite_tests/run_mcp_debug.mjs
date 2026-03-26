import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
    console.log("Starting TestSprite MCP Client...");

    const transport = new StdioClientTransport({
        command: "node",
        args: ["./node_modules/.bin/testsprite-mcp-plugin", "server"],
        env: { ...process.env, TESTSPRITE_API_KEY: "sk-user-7qO6TwvHxuwfxOfZb_Bgc3mb7NR_G4VC1-pjDHa_kYLJLdBgQSLCgVktUO-J4hnyEssnaj2VVrUGqhCFsJZScZTsBsFpNH6WP4X13PFRxk-mwsCRyt_8dXSXcEpR9tknNTc" }
    });

    const client = new Client(
        { name: "testsprite-runner", version: "1.0.0" },
        { capabilities: {} }
    );

    // Add error listener to see connection issues
    client.onclose = () => console.log("Connection closed");
    client.onerror = (e) => console.error("Client error:", e);

    try {
        console.log("Connecting...");
        await client.connect(transport);
        console.log("Connected to MCP server!");

        console.log("Listing tools...");
        const tools = await client.listTools();
        console.log("Available tools:", tools.tools.map(t => t.name));

        if (tools.tools.find(t => t.name === "testsprite_generate_code_and_execute")) {
            console.log("Submitting to TestSprite testing engine! (This may take several minutes...)");
            const result = await client.callTool({
                name: "testsprite_generate_code_and_execute",
                arguments: {
                    projectCommand: "npm run build",
                    projectPath: "/Users/jack/Documents/Aurelian_Trading_Platform",
                    testInstruction: "Find all errors in the React website. Particularly check the Quotes.jsx and App.jsx",
                    projectContext: "React SPA with generic issues"
                }
            });
            console.log("\n==== TESTSPRITE RESULTS ====\n");
            console.log(JSON.stringify(result, null, 2));
            console.log("\n============================\n");
        }
    } catch (error) {
        console.error("Fatal Error:", error);
    } finally {
        console.log("Closing transport.");
        process.exit(0);
    }
}

main();
