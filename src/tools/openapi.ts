import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { load } from "../openapi/loader.js";
import { OpenAPIV3 } from "openapi-types";



export type Tool = {
    name: string,
    description: string,
    paramsSchema: any,
    toolCallback: ToolCallback
}

export async function getTools(): Promise<Tool[]> {
    const apiDoc: OpenAPIV3.Document = await load() as OpenAPIV3.Document;
    const tools: Tool[] = [];

    // Iterate through all paths in the API document
    for (const path in apiDoc.paths) {
        const pathItem: OpenAPIV3.PathItemObject | undefined = apiDoc.paths[path];
        if (!pathItem) continue;

        // Iterate through all HTTP methods in the path
        for (const method in OpenAPIV3.HttpMethods) {
            const operation: OpenAPIV3.OperationObject | undefined = pathItem[method.toLowerCase() as OpenAPIV3.HttpMethods] as OpenAPIV3.OperationObject | undefined;
            if (!operation) continue;

            // Get the operation name, use operationId if available, or generate one
            const operationName: string = operation.operationId || `${method}${path.replace(/\//g, '_').replace(/[{}]/g, '')}`;
            
            // Collect parameters from both path item and operation levels
            const pathParameters: OpenAPIV3.ParameterObject[] = (pathItem.parameters as OpenAPIV3.ParameterObject[]) || [];
            const operationParameters: OpenAPIV3.ParameterObject[] = (operation.parameters as OpenAPIV3.ParameterObject[]) || [];
            const allParameters: OpenAPIV3.ParameterObject[] = [...pathParameters, ...operationParameters];

            // Extract request body if present
            const requestBody: OpenAPIV3.RequestBodyObject | null = operation.requestBody ?
                (typeof operation.requestBody === 'object' ? operation.requestBody as OpenAPIV3.RequestBodyObject : null) :
                null;


            // Define the tool's parameter schema for the MCP protocol
            const parameterSchema: Record<string, any> = {
                type: "object",
                properties: {},
                required: []
            };

            // Process path, query and header parameters
            allParameters.forEach(param => {
                if (!param.name) return;
                
                // Add parameter to the properties
                parameterSchema.properties[param.name] = {
                    ...param.schema,
                    description: param.description || `${param.name} parameter`
                };
                
                // If parameter is required, add to required array
                if (param.required) {
                    parameterSchema.required.push(param.name);
                }
            });

            // Process request body if present
            if (requestBody && requestBody.content) {
                const contentType = Object.keys(requestBody.content)[0]; // Take the first content type
                if (contentType && requestBody.content[contentType].schema) {
                    const bodySchema: OpenAPIV3.SchemaObject = requestBody.content[contentType].schema as OpenAPIV3.SchemaObject;
                    
                    // For simplicity, we'll flatten the body properties into the main parameters
                    // This is a naive implementation that can be overwritten
                    if (bodySchema.properties) {
                        for (const propName in bodySchema.properties) {
                            parameterSchema.properties[propName] = {
                                ...bodySchema.properties[propName],
                                description: (bodySchema.properties[propName] as OpenAPIV3.SchemaObject).description || `${propName} from request body`
                            };
                        }
                        
                        // Add required properties from the request body
                        if (bodySchema.required && Array.isArray(bodySchema.required)) {
                            parameterSchema.required.push(...bodySchema.required);
                        }
                    }
                }
                
                // If the request body itself is required, we should ensure at least one property is provided
                // This is a simplification; in practice, you might handle this differently
                if (requestBody.required && parameterSchema.required.length === 0 && 
                    Object.keys(parameterSchema.properties).length > 0) {
                    parameterSchema.required.push(Object.keys(parameterSchema.properties)[0]);
                }
            }

            // Create the tool callback function
            const toolCallback: ToolCallback = async (params): Promise<any> => {
                //paramSchema contains all the parameters
                // Here you would add the actual implementation to call the API
                return {
                    name: operationName,
                    message: `Executed ${method.toUpperCase()} ${path} with parameters: ${JSON.stringify(params)}`,
                    // In a real implementation, you would make the actual API call and return results
                };
            };

            // Create the tool with name and callback
            const tool: Tool = {
                name: operationName,
                description: operation.description || `Tool for ${operationName} ${method.toUpperCase()} ${path}`,
                paramsSchema: parameterSchema,
                toolCallback: toolCallback
            };

            tools.push(tool);
        }
    }

    return tools;
}