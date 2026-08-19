import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    htmlToMarkdown,
    parseStaffId,
    parseProjectsDataTable,
    parseProjectDetailsHtml,
    parseTasksDataTable,
    parseTaskDetailsHtml
} from '../../src/services/perfex/perfexParser.js';

test('htmlToMarkdown converts HTML tags to markdown cleanly', () => {
    const html = '<h3>Título do Projeto</h3><p>Descrição com <strong>negrito</strong> e <a href="https://example.com">link</a>.</p>';
    const md = htmlToMarkdown(html);
    assert.ok(md.includes('### Título do Projeto'));
    assert.ok(md.includes('**negrito**'));
    assert.ok(md.includes('[link](https://example.com)'));
});

test('parseStaffId extracts staff_id from profile HTML', () => {
    const html = '<input type="hidden" name="staff_id" value="14">';
    const staffId = parseStaffId(html);
    assert.equal(staffId, '14');
});

test('parseProjectsDataTable extracts projects from DataTables JSON', () => {
    const json = {
        aaData: [
            {
                "0": '<a href="https://perfex.example.com/admin/projects/view/79">79</a>',
                "1": '<a href="https://perfex.example.com/admin/projects/view/79">Novo Site</a>',
                "2": '<a href="https://perfex.example.com/admin/clients/client/9">Cliente X</a>',
                "4": '02/08/2019',
                "5": '04/10/2019',
                "7": '<span class="label project-status-4">Concluido</span>'
            }
        ]
    };
    const projects = parseProjectsDataTable(json);
    assert.equal(projects.length, 1);
    assert.equal(projects[0].id, '79');
    assert.equal(projects[0].name, 'Novo Site');
    assert.equal(projects[0].client, 'Cliente X');
    assert.equal(projects[0].statusId, '4');
    assert.equal(projects[0].status, 'Concluido');
});

test('parseProjectDetailsHtml extracts structured project details', () => {
    const html = `
        <h3 class="project-name">Projeto Teste MCP</h3>
        <a href="https://perfex.example.com/admin/clients/client/5">Cliente ABC</a>
        <span class="project-status project-status-2">Em Progresso</span>
        <div class="project-overview-left">
            <p>Data de início: 01/01/2026</p>
            <p>Prazo: 31/12/2026</p>
        </div>
        <div class="tc-content"><p>Descrição detalhada do projeto em <strong>HTML</strong>.</p></div>
        <div class="project-progress" data-value="58"></div>
        <a href="https://perfex.example.com/admin/profile/14">Leonardo Persan</a>
    `;
    const details = parseProjectDetailsHtml(html, '100');
    assert.equal(details.id, '100');
    assert.equal(details.name, 'Projeto Teste MCP');
    assert.equal(details.client, 'Cliente ABC');
    assert.equal(details.statusId, '2');
    assert.equal(details.progressPercentage, '58%');
    assert.ok(details.description.includes('**HTML**'));
    assert.ok(details.members.includes('Leonardo Persan'));
});

test('parseTasksDataTable extracts tasks and timer states', () => {
    const json = {
        aaData: [
            {
                "0": '<div class="checkbox"><input type="checkbox" value="2328"></div>',
                "1": '<a href="...">2328</a>',
                "2": '<a class="main-tasks-table-href-name">Desenvolver MCP Server</a><a onclick="timer_action(this,2328,55);">Stop</a>',
                "3": '<span task-status-table="4">Em Progresso</span>',
                "4": '01/02/2026',
                "5": '15/02/2026',
                "6": '<span class="hide">Leonardo Persan, Joice Nicolau</span>',
                "8": '<span>Alta</span>'
            }
        ]
    };
    const tasks = parseTasksDataTable(json);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].id, '2328');
    assert.equal(tasks[0].title, 'Desenvolver MCP Server');
    assert.equal(tasks[0].statusId, '4');
    assert.equal(tasks[0].priority, 'Alta');
    assert.equal(tasks[0].isTimerActive, true);
    assert.equal(tasks[0].activeTimerId, '55');
    assert.ok(tasks[0].assignees.includes('Leonardo Persan'));
});

test('parseTaskDetailsHtml extracts comments and checklist', () => {
    const html = `
        <h4 class="task-single-col-title">Implementar MCP Server [#2328]</h4>
        <select name="status"><option value="4" selected>Em Progresso</option></select>
        <div class="task-info">Prioridade: Alta</div>
        <div id="task_view_description"><p>Especificação técnica do servidor MCP.</p></div>
        <div id="comment_1">
            <a class="bold">Leonardo Persan</a>
            <span class="task-date">12/08/2026 20:00</span>
            <div class="task_comment_text"><p>Primeiro comentário sobre a tarefa.</p></div>
        </div>
    `;
    const details = parseTaskDetailsHtml(html, '2328');
    assert.equal(details.id, '2328');
    assert.equal(details.title, 'Implementar MCP Server [#2328]');
    assert.equal(details.statusId, '4');
    assert.ok(details.descriptionMarkdown.includes('Especificação técnica'));
    assert.equal(details.comments.length, 1);
    assert.equal(details.comments[0].author, 'Leonardo Persan');
    assert.ok(details.comments[0].contentMarkdown.includes('Primeiro comentário'));
});
