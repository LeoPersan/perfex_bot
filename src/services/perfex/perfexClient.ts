import {
    PerfexAuthConfig,
    PerfexProject,
    PerfexProjectDetails,
    PerfexTask,
    PerfexTaskDetails,
    PerfexListProjectsFilter,
    PerfexListTasksFilter,
    PerfexMutationResult
} from './perfexTypes.js';

import {
    parseProjectsDataTable,
    parseProjectDetailsHtml,
    parseTasksDataTable,
    parseTaskDetailsHtml
} from './perfexParser.js';

export class PerfexClient {
    private config: PerfexAuthConfig;
    private fetchFn: typeof fetch;

    constructor(config?: Partial<PerfexAuthConfig>, customFetch?: typeof fetch) {
        const baseUrl = config?.baseUrl || process.env.PERFEX_BASE_URL || 'https://seu-perfex-crm.com';
        const csrfToken = config?.csrfToken || process.env.PERFEX_CSRF_COOKIE || '';
        const sessionCookie = config?.sessionCookie || process.env.PERFEX_SESSION_COOKIE || '';

        this.config = {
            baseUrl: baseUrl.replace(/\/+$/, ''),
            csrfToken,
            sessionCookie
        };
        this.fetchFn = customFetch || globalThis.fetch;
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const url = `${this.config.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
        const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
            'Cookie': `csrf_cookie_name=${this.config.csrfToken}; sp_session=${this.config.sessionCookie}`,
            ...(options.headers as Record<string, string> || {})
        };

        const response = await this.fetchFn(url, { ...options, headers });
        if (!response.ok) {
            throw new Error(`Perfex API request failed: HTTP ${response.status} ${response.statusText}`);
        }
        return response;
    }

    public async listProjects(filter?: PerfexListProjectsFilter): Promise<PerfexProject[]> {
        const params = new URLSearchParams();
        params.append('draw', '1');
        params.append('start', '0');
        params.append('length', '100');
        params.append('csrf_token_name', this.config.csrfToken);

        if (filter?.statusId) {
            params.append(`project_status_${filter.statusId}`, String(filter.statusId));
        }
        if (filter?.name || filter?.code) {
            params.append('search[value]', String(filter.name || filter.code));
        }

        const res = await this.request('admin/projects/table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        });

        const json = await res.json();
        let projects = parseProjectsDataTable(json);

        if (filter?.statusId) {
            projects = projects.filter(p => String(p.statusId) === String(filter.statusId));
        }
        if (filter?.code) {
            projects = projects.filter(p => String(p.id) === String(filter.code));
        }
        if (filter?.name) {
            const searchTerm = String(filter.name).toLowerCase();
            projects = projects.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        return projects;
    }

    public async getProjectDetails(projectId: string | number): Promise<PerfexProjectDetails> {
        const res = await this.request(`admin/projects/view/${projectId}`);
        const html = await res.text();
        return parseProjectDetailsHtml(html, String(projectId));
    }

    public async listTasks(filter?: PerfexListTasksFilter): Promise<PerfexTask[]> {
        const endpoint = filter?.projectId
            ? `admin/tasks/init_relation_tasks/${filter.projectId}/project?bulk_actions=true`
            : `admin/tasks/table?bulk_actions=true`;

        const params = new URLSearchParams();
        params.append('draw', '1');
        params.append('start', '0');
        params.append('length', '200');
        params.append('csrf_token_name', this.config.csrfToken);

        if (!filter?.allTasks) {
            params.append('my_tasks', 'true');
        }

        if (filter?.statusId) {
            params.append(`task_status_${filter.statusId}`, 'true');
        }

        if (filter?.name || filter?.code) {
            params.append('search[value]', String(filter.name || filter.code));
        }

        const res = await this.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        });

        const json = await res.json();
        let tasks = parseTasksDataTable(json);

        if (filter?.statusId) {
            tasks = tasks.filter(t => String(t.statusId) === String(filter.statusId));
        }
        if (filter?.code) {
            tasks = tasks.filter(t => String(t.id) === String(filter.code));
        }
        if (filter?.name) {
            const searchTerm = String(filter.name).toLowerCase();
            tasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm));
        }
        if (filter?.assignee) {
            const assigneeTerm = String(filter.assignee).toLowerCase();
            tasks = tasks.filter(t => t.assignees.some(a => a.toLowerCase().includes(assigneeTerm)));
        }

        return tasks;
    }

    public async getTaskDetails(taskId: string | number): Promise<PerfexTaskDetails> {
        const res = await this.request(`admin/tasks/get_task_data/${taskId}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const html = await res.text();
        return parseTaskDetailsHtml(html, String(taskId));
    }

    public async addTaskComment(taskId: string | number, comment: string): Promise<PerfexMutationResult> {
        const params = new URLSearchParams();
        params.append('taskid', String(taskId));
        params.append('content', comment);
        params.append('no_editor', 'true');
        params.append('csrf_token_name', this.config.csrfToken);

        const res = await this.request('admin/tasks/add_task_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        });

        const text = await res.text();
        let resObj: any;
        try {
            resObj = JSON.parse(text);
        } catch {
            resObj = { taskHtml: text };
        }

        return {
            success: true,
            message: 'Comentário adicionado com sucesso',
            taskHtml: resObj.taskHtml,
            commentId: resObj.comment_id ? String(resObj.comment_id) : undefined
        };
    }

    public async toggleTaskTimer(taskId: string | number, action: 'start' | 'pause', timerId?: string): Promise<PerfexMutationResult> {
        const params = new URLSearchParams();
        params.append('csrf_token_name', this.config.csrfToken);
        params.append('task_id', String(taskId));
        params.append('timer_id', action === 'pause' ? (timerId || '') : '');
        params.append('note', '');

        const res = await this.request('admin/tasks/timer_tracking?single_task=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        });

        const text = await res.text();
        let resObj: any;
        try {
            resObj = JSON.parse(text);
        } catch {
            resObj = { taskHtml: text };
        }

        return {
            success: true,
            message: action === 'start' ? 'Cronômetro iniciado com sucesso' : 'Cronômetro pausado com sucesso',
            taskHtml: resObj.taskHtml,
            activeTimerId: action === 'start' ? String(taskId) : null
        };
    }

    public async updateTaskStatus(taskId: string | number, statusId: number | string): Promise<PerfexMutationResult> {
        const res = await this.request(`admin/tasks/mark_as/${statusId}/${taskId}?single_task=true`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        const text = await res.text();
        let resObj: any;
        try {
            resObj = JSON.parse(text);
        } catch {
            resObj = { message: 'Status alterado' };
        }

        return {
            success: resObj.success !== false,
            message: resObj.message || `Status da tarefa #${taskId} alterado para ${statusId}`,
            taskHtml: resObj.taskHtml
        };
    }
}
