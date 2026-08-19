import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PerfexClient } from '../../src/services/perfex/perfexClient.js';

function createMockFetch(responses: Record<string, { status?: number; body: string | object }>) {
    return (async (url: any): Promise<Response> => {
        const urlStr = String(url);
        for (const [key, value] of Object.entries(responses)) {
            if (urlStr.includes(key)) {
                const bodyStr = typeof value.body === 'object' ? JSON.stringify(value.body) : value.body;
                return new Response(bodyStr, {
                    status: value.status || 200,
                    headers: { 'Content-Type': typeof value.body === 'object' ? 'application/json' : 'text/html' }
                });
            }
        }
        return new Response('Not Found', { status: 404 });
    }) as typeof fetch;
}

test('PerfexClient.listProjects lists projects and filters by status/name', async () => {
    const mockFetch = createMockFetch({
        'admin/projects/table': {
            body: {
                aaData: [
                    { "0": '<a>10</a>', "1": '<a>Site Ecommerce</a>', "2": '<a>Cliente A</a>', "4": '01/01/2026', "5": '30/01/2026', "7": '<span class="project-status-2">Em Progresso</span>' },
                    { "0": '<a>20</a>', "1": '<a>App Mobile</a>', "2": '<a>Cliente B</a>', "4": '01/02/2026', "5": '28/02/2026', "7": '<span class="project-status-4">Concluido</span>' }
                ]
            }
        }
    });

    const client = new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'csrf123', sessionCookie: 'sess123' }, mockFetch);

    const allProjects = await client.listProjects();
    assert.equal(allProjects.length, 2);

    const filteredProjects = await client.listProjects({ name: 'Ecommerce' });
    assert.equal(filteredProjects.length, 1);
    assert.equal(filteredProjects[0].id, '10');
});

test('PerfexClient.getProjectDetails fetches and parses project HTML', async () => {
    const mockFetch = createMockFetch({
        'admin/projects/view/10': {
            body: '<h3 class="project-name">Site Ecommerce</h3><span class="project-status project-status-2">Em Progresso</span>'
        }
    });

    const client = new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'csrf123', sessionCookie: 'sess123' }, mockFetch);
    const details = await client.getProjectDetails('10');
    assert.equal(details.id, '10');
    assert.equal(details.name, 'Site Ecommerce');
    assert.equal(details.statusId, '2');
});

test('PerfexClient.listTasks lists tasks with my_tasks by default and filters', async () => {
    const mockFetch = createMockFetch({
        'admin/tasks/table': {
            body: {
                aaData: [
                    { "0": '<input value="101">', "1": '<a>101</a>', "2": '<a class="main-tasks-table-href-name">Criar API</a>', "3": '<span task-status-table="4">Em Progresso</span>', "4": '01/01/2026', "5": '05/01/2026', "6": '<span class="hide">Dev A</span>', "8": '<span>Alta</span>' },
                    { "0": '<input value="102">', "1": '<a>102</a>', "2": '<a class="main-tasks-table-href-name">Refatorar UI</a>', "3": '<span task-status-table="1">Não Iniciado</span>', "4": '02/01/2026', "5": '06/01/2026', "6": '<span class="hide">Dev B</span>', "8": '<span>Média</span>' }
                ]
            }
        }
    });

    const client = new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'csrf123', sessionCookie: 'sess123' }, mockFetch);

    const tasks = await client.listTasks({ assignee: 'Dev A' });
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].id, '101');
    assert.equal(tasks[0].title, 'Criar API');
});

test('PerfexClient.getTaskDetails fetches task modal details', async () => {
    const mockFetch = createMockFetch({
        'admin/tasks/get_task_data/101': {
            body: '<h4 class="task-single-col-title">Criar API [#101]</h4><select name="status"><option value="4" selected>Em Progresso</option></select>'
        }
    });

    const client = new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'csrf123', sessionCookie: 'sess123' }, mockFetch);
    const details = await client.getTaskDetails('101');
    assert.equal(details.id, '101');
    assert.equal(details.title, 'Criar API [#101]');
});

test('PerfexClient.addTaskComment posts comment data', async () => {
    const mockFetch = createMockFetch({
        'admin/tasks/add_task_comment': {
            body: { success: true, comment_id: 88, taskHtml: '<div>Updated</div>' }
        }
    });

    const client = new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'csrf123', sessionCookie: 'sess123' }, mockFetch);
    const result = await client.addTaskComment('101', 'Novo comentário de teste');
    assert.equal(result.success, true);
    assert.equal(result.commentId, '88');
});

test('PerfexClient.toggleTaskTimer starts and pauses timer', async () => {
    const mockFetch = createMockFetch({
        'admin/tasks/timer_tracking': {
            body: { taskHtml: '<div class="stop-timer">Timer Active</div>' }
        }
    });

    const client = new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'csrf123', sessionCookie: 'sess123' }, mockFetch);

    const startRes = await client.toggleTaskTimer('101', 'start');
    assert.equal(startRes.success, true);
    assert.equal(startRes.message, 'Cronômetro iniciado com sucesso');

    const pauseRes = await client.toggleTaskTimer('101', 'pause', '55');
    assert.equal(pauseRes.success, true);
    assert.equal(pauseRes.message, 'Cronômetro pausado com sucesso');
});

test('PerfexClient.updateTaskStatus updates task status', async () => {
    const mockFetch = createMockFetch({
        'admin/tasks/mark_as/5/101': {
            body: { success: true, message: 'Status alterado para Completo' }
        }
    });

    const client = new PerfexClient({ baseUrl: 'https://perfex.test', csrfToken: 'csrf123', sessionCookie: 'sess123' }, mockFetch);
    const result = await client.updateTaskStatus('101', 5);
    assert.equal(result.success, true);
    assert.equal(result.message, 'Status alterado para Completo');
});

test('PerfexClient defaults to generic fallback URL when env and config are missing', () => {
    const originalEnv = process.env.PERFEX_BASE_URL;
    delete process.env.PERFEX_BASE_URL;
    try {
        const client = new PerfexClient();
        assert.equal((client as any).config.baseUrl, 'https://seu-perfex-crm.com');
    } finally {
        if (originalEnv !== undefined) {
            process.env.PERFEX_BASE_URL = originalEnv;
        }
    }
});

