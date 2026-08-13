import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPerfexMcpServer } from '../../src/mcp/server.js';
import { PerfexClient } from '../../src/services/perfex/perfexClient.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

function createMockClient(): PerfexClient {
    const mockFetch = (async () => new Response(JSON.stringify({ aaData: [] }))) as typeof fetch;
    return new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'token', sessionCookie: 'sess' }, mockFetch);
}

test('Perfex MCP Server registers 7 tools', async () => {
    const server = createPerfexMcpServer(createMockClient());
    // Access the list tools handler directly from the internal server instance
    const handler = (server as any)._requestHandlers.get(ListToolsRequestSchema.shape.method.value);
    assert.ok(handler);

    const response = await handler({ method: 'tools/list' });
    assert.equal(response.tools.length, 7);

    const toolNames = response.tools.map((t: any) => t.name);
    assert.ok(toolNames.includes('perfex_list_projects'));
    assert.ok(toolNames.includes('perfex_get_project_details'));
    assert.ok(toolNames.includes('perfex_list_tasks'));
    assert.ok(toolNames.includes('perfex_get_task_details'));
    assert.ok(toolNames.includes('perfex_add_task_comment'));
    assert.ok(toolNames.includes('perfex_toggle_task_timer'));
    assert.ok(toolNames.includes('perfex_update_task_status'));
});

test('Perfex MCP Server call_tool invokes perfex_list_projects', async () => {
    const mockClient = createMockClient();
    mockClient.listProjects = async (filter) => [
        { id: '1', name: 'Projeto A', client: 'Cliente X', startDate: '', deadline: '', statusId: '2', status: 'Em Progresso' }
    ];

    const server = createPerfexMcpServer(mockClient);
    const handler = (server as any)._requestHandlers.get(CallToolRequestSchema.shape.method.value);
    assert.ok(handler);

    const res = await handler({
        method: 'tools/call',
        params: {
            name: 'perfex_list_projects',
            arguments: { name: 'Projeto A' }
        }
    });

    assert.equal(res.isError, undefined);
    assert.equal(res.content.length, 1);
    const data = JSON.parse(res.content[0].text);
    assert.equal(data.length, 1);
    assert.equal(data[0].id, '1');
});
