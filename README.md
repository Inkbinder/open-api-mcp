# open-api-mcp
A MCP Server that exposes tools based on an OpenAPI spec written in Typescript

# Getting Started

To run the server as a tool directly using npx add the following mcpServer configuration to your Claude Desktop configuration. If this is your first time using MCP with Claude Desktop, more instructions can be found here: https://modelcontextprotocol.io/quickstart/user

```json
{
  "mcpServers": {
    "open-api": {
      "command": "npx @inkbinder/stdio",
      "args": [
        "-path",
        "/path/to/your/open-api-spec.yaml"
      ],
      "env": { }
    }
  }
}
```

The above will use the stdio implementation of the package.

# Running as a server

