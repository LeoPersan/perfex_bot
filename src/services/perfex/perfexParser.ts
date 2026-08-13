import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import {
    PerfexProject,
    PerfexProjectDetails,
    PerfexTask,
    PerfexTaskComment,
    PerfexTaskDetails,
    PerfexChecklistItem
} from './perfexTypes.js';

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

const STATUS_LABELS: Record<string, string> = {
    "1": "Não Iniciado",
    "4": "Em Progresso",
    "100": "Em Homologação",
    "3": "Em Teste",
    "2": "Aguardando Feedback",
    "5": "Completo",
    "101": "Backlog",
};

export function htmlToMarkdown(html: string | null | undefined): string {
    if (!html) return '';
    const cleanedHtml = html
        .replace(/<script\b[^<]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^<]*>[\s\S]*?<\/style>/gi, '');
    return turndownService.turndown(cleanedHtml).trim();
}

export function stripHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
}

export function parseStaffId(html: string): string | null {
    if (!html) return null;
    const match = html.match(/name=["']staff_id["'][^>]*value=["'](\d+)["']/i) ||
                  html.match(/value=["'](\d+)["'][^>]*name=["']staff_id["']/i) ||
                  html.match(/staff_id[^>]*value=["'](\d+)["']/i);
    return match ? match[1] : null;
}

export function extractLinkTextOrStrip(html: string): string {
    if (!html) return '';
    const match = html.match(/<a[^>]*>([^<]+)<\/a>/);
    return match ? match[1].trim() : stripHtml(html);
}

function parseProjectRow(row: Record<string, string>): PerfexProject | null {
    const idMatch = (row["0"] || "").match(/>(\d+)</);
    const id = idMatch ? idMatch[1] : stripHtml(row["0"]);
    if (!id) return null;

    const name = extractLinkTextOrStrip(row["1"]);
    const client = extractLinkTextOrStrip(row["2"]);
    const startDate = stripHtml(row["4"]);
    const deadline = stripHtml(row["5"]);

    const statusHtml = row["7"] || "";
    const statusIdMatch = statusHtml.match(/project-status-(\d+)/);
    const statusId = statusIdMatch ? statusIdMatch[1] : "2";
    const status = stripHtml(statusHtml) || "Em Progresso";

    return { id, name, client, startDate, deadline, statusId, status };
}

export function parseProjectsDataTable(projectsJson: any): PerfexProject[] {
    const rows = projectsJson?.aaData || [];
    const projects: PerfexProject[] = [];
    for (const row of rows) {
        const proj = parseProjectRow(row);
        if (proj) projects.push(proj);
    }
    return projects;
}

export function parseProjectDetailsHtml(html: string, projectId: string): PerfexProjectDetails {
    const $ = cheerio.load(html);
    const name = $('h3.project-name, .project-name, h3').first().text().trim() || `Projeto #${projectId}`;
    const client = $('a[href*="clients/client"]').first().text().trim() || '';

    const statusElement = $('.project-status, .label').first();
    const status = statusElement.text().trim() || 'Desconhecido';
    const statusClass = statusElement.attr('class') || '';
    const statusIdMatch = statusClass.match(/project-status-(\d+)/);
    const statusId = statusIdMatch ? statusIdMatch[1] : '0';

    const membersSet = new Set<string>();
    $('a[href*="profile/"]').each((_, el) => {
        const text = $(el).text().trim();
        if (text && !text.toLowerCase().includes('ver') && text.length > 1) membersSet.add(text);
    });

    const descriptionHtml = $('.tc-content, #project_overview_description').html() || '';
    return {
        id: projectId,
        name,
        client,
        statusId,
        status,
        startDate: '',
        deadline: '',
        description: htmlToMarkdown(descriptionHtml),
        members: Array.from(membersSet),
        progressPercentage: $('.progress-bar').first().text().trim() || '0%'
    };
}

export function extractTaskTimerInfo(row: any, titleHtml: string): { isTimerActive: boolean; activeTimerId: string | null } {
    const rowStr = JSON.stringify(row);
    const isTimerActive = titleHtml.includes('fa-clock-o') ||
                          titleHtml.includes('tasks-table-stop-timer') ||
                          rowStr.includes('tasks-table-stop-timer') ||
                          rowStr.includes('stop-timer') ||
                          /timer_action\([^,]+,\s*\d+,\s*\d+\)/.test(rowStr);
    let activeTimerId: string | null = null;
    if (isTimerActive) {
        const timerIdMatch = rowStr.match(/timer_action\([^,]+,\s*\d+,\s*(\d+)\)/) || titleHtml.match(/timer_action\([^,]+,\s*\d+,\s*(\d+)\)/);
        if (timerIdMatch) activeTimerId = timerIdMatch[1];
    }
    return { isTimerActive, activeTimerId };
}

export function extractTaskLoggedTime(row: any): string | null {
    const rowContent = typeof row === 'object' ? Object.values(row).join(' ') : String(row);
    const matchExplicit = rowContent.match(/(?:tempo logado|logged time|total logado|tempo total)[^0-9]*(\d{1,2}:\d{2}(?::\d{2})?)/i);
    if (matchExplicit) return matchExplicit[1].trim();

    for (const val of Object.values(row)) {
        if (typeof val === 'string' && val.includes(':')) {
            const timeMatch = val.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
            if (timeMatch && !val.includes('http') && !val.includes('value=') && !val.includes('task-status')) {
                return timeMatch[1];
            }
        }
    }
    return null;
}

function parseAssignees(assigneeHtml: string): string[] {
    const set = new Set<string>();
    const hideMatch = assigneeHtml.match(/class=["']hide["']>([^<]+)/);
    if (hideMatch) {
        hideMatch[1].split(',').forEach(a => set.add(a.trim()));
    } else {
        const clean = stripHtml(assigneeHtml);
        if (clean) set.add(clean);
    }
    return Array.from(set).filter(Boolean);
}

function parseSingleTaskRow(row: Record<string, string>): PerfexTask | null {
    const idMatch = (row["0"] || "").match(/value=["'](\d+)["']/) || (row["1"] || "").match(/>(\d+)</);
    if (!idMatch) return null;
    const id = idMatch[1];

    const titleHtml = row["2"] || "";
    const titleMatch = titleHtml.match(/class=["'](?:[^"']*?main-tasks-table-href-name[^"']*?)["'][^>]*>([^<]+)/) || titleHtml.match(/<a[^>]*>([^<]+)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim() : stripHtml(titleHtml);

    const statusMatch = (row["3"] || "").match(/task-status-table=["'](\d+)["']/);
    const statusId = statusMatch ? statusMatch[1] : "";
    const status = STATUS_LABELS[statusId] || stripHtml(row["3"]) || `Status ${statusId}`;

    const { isTimerActive, activeTimerId } = extractTaskTimerInfo(row, titleHtml);

    return {
        id,
        title,
        statusId,
        status,
        startDate: stripHtml(row["4"]),
        dueDate: stripHtml(row["5"]),
        assignees: parseAssignees(row["6"] || ""),
        priority: stripHtml(row["8"]) || "Média",
        isTimerActive,
        activeTimerId,
        loggedTime: extractTaskLoggedTime(row)
    };
}

export function parseTasksDataTable(tasksJson: any): PerfexTask[] {
    const rows = tasksJson?.aaData || [];
    const tasks: PerfexTask[] = [];
    for (const row of rows) {
        const t = parseSingleTaskRow(row);
        if (t) tasks.push(t);
    }
    return tasks;
}

function parseTaskComments($: cheerio.CheerioAPI): PerfexTaskComment[] {
    const comments: PerfexTaskComment[] = [];
    $('[id^="comment_"], .task-comment').each((_, el) => {
        const commentEl = $(el);
        const id = commentEl.attr('id')?.replace('comment_', '') || String(comments.length + 1);
        const author = commentEl.find('a.bold, .task-comment-user-name').first().text().trim() || 'Usuário';
        const date = commentEl.find('.task-date, .text-has-action, small').first().text().trim() || '';
        const contentHtml = commentEl.find('.task_comment_text, .tc-content').html() || '';
        const contentMarkdown = htmlToMarkdown(contentHtml);
        if (contentMarkdown) comments.push({ id, author, date, contentMarkdown });
    });
    return comments;
}

function parseChecklistItems($: cheerio.CheerioAPI): PerfexChecklistItem[] {
    const checklistItems: PerfexChecklistItem[] = [];
    $('.checklist, [data-checklist-id]').each((_, el) => {
        const itemEl = $(el);
        const id = itemEl.attr('data-checklist-id') || String(checklistItems.length + 1);
        const text = itemEl.find('.checkbox-inline, label, span').text().trim();
        const finished = itemEl.find('input[type="checkbox"]').is(':checked');
        if (text) checklistItems.push({ id, description: text, finished });
    });
    return checklistItems;
}

export function parseTaskDetailsHtml(html: string, taskId: string): PerfexTaskDetails {
    const $ = cheerio.load(html);
    const title = $('.task-single-menu-caption, h4.task-single-col-title, .modal-title').first().text().trim() || `Tarefa #${taskId}`;

    const statusSelect = $('select[name="status"]');
    const statusId = statusSelect.val() ? String(statusSelect.val()) : '';
    const status = statusSelect.find('option:selected').text().trim() || STATUS_LABELS[statusId] || 'Desconhecido';

    const assigneesSet = new Set<string>();
    $('[data-task-assignee-id], .task-single-assignees a, .task-staff-member').each((_, el) => {
        const text = $(el).text().trim();
        if (text) assigneesSet.add(text);
    });

    const followersSet = new Set<string>();
    $('[data-task-follower-id], .task-single-followers a').each((_, el) => {
        const text = $(el).text().trim();
        if (text) followersSet.add(text);
    });

    const timerMatch = html.match(/timer_action\([^,]+,\s*\d+,\s*(\d+)\)/);

    return {
        id: taskId,
        title,
        statusId,
        status,
        priority: 'Média',
        startDate: '',
        dueDate: '',
        assignees: Array.from(assigneesSet),
        followers: Array.from(followersSet),
        descriptionMarkdown: htmlToMarkdown($('#task_view_description, .tc-content').first().html() || ''),
        loggedTime: null,
        isTimerActive: html.includes('stop-timer'),
        activeTimerId: timerMatch ? timerMatch[1] : null,
        checklistItems: parseChecklistItems($),
        comments: parseTaskComments($)
    };
}
