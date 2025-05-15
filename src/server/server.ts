import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {getTools} from "../tools/openapi.js";


export default async function server(): Promise<McpServer> {
    const server = new McpServer({
        name: "open-api-mcp",
        version: "0.0.1"
    });

    const tools = await getTools();
    tools.forEach(tool => server.tool(tool.name, tool.description, tool.paramsSchema, tool.toolCallback));


    return server;
}