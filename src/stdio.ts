import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server/server.js";

const mcpServer: McpServer = await server();
const transport = new StdioServerTransport();
await mcpServer.connect(transport);