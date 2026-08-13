function getProjectTools() {
    return [
        {
            name: 'perfex_list_projects',
            description: 'Listar projetos no Perfex CRM com suporte a filtro por status, nome e código do projeto.',
            inputSchema: {
                type: 'object',
                properties: {
                    statusId: { type: ['string', 'number'], description: 'ID do status (1: Não Iniciado, 2: Em Progresso, 3: Em Homologação, 4: Concluído, 5: Cancelado)' },
                    name: { type: 'string', description: 'Termo de busca pelo nome do projeto' },
                    code: { type: ['string', 'number'], description: 'ID ou código exato do projeto' }
                }
            }
        },
        {
            name: 'perfex_get_project_details',
            description: 'Exibir detalhes completos de um projeto no Perfex CRM (cliente, status, membros, progresso e descrição em Markdown).',
            inputSchema: {
                type: 'object',
                properties: {
                    projectId: { type: ['string', 'number'], description: 'ID do projeto' }
                },
                required: ['projectId']
            }
        }
    ];
}

function getTaskReadTools() {
    return [
        {
            name: 'perfex_list_tasks',
            description: 'Listar tarefas no Perfex CRM com filtro por projeto, status, código, nome e destinatários (padrão: tarefas do usuário).',
            inputSchema: {
                type: 'object',
                properties: {
                    projectId: { type: ['string', 'number'], description: 'ID do projeto associado' },
                    statusId: { type: ['string', 'number'], description: 'ID do status (101: Backlog, 1: Não Iniciado, 4: Em Progresso, 100: Em Homologação, 3: Em Teste, 2: Aguardando Feedback, 5: Completo)' },
                    code: { type: ['string', 'number'], description: 'ID ou código exato da tarefa' },
                    name: { type: 'string', description: 'Termo de busca pelo nome/título da tarefa' },
                    assignee: { type: 'string', description: 'Nome do responsável/destinatário' },
                    allTasks: { type: 'boolean', description: 'Se true, busca em todas as tarefas da empresa em vez de apenas my_tasks (padrão: false)' }
                }
            }
        },
        {
            name: 'perfex_get_task_details',
            description: 'Exibir detalhes completos de uma tarefa (prioridade, responsável, tempo logado, checklists, comentários em Markdown).',
            inputSchema: {
                type: 'object',
                properties: {
                    taskId: { type: ['string', 'number'], description: 'ID da tarefa' }
                },
                required: ['taskId']
            }
        }
    ];
}

function getTaskActionTools() {
    return [
        {
            name: 'perfex_add_task_comment',
            description: 'Adicionar um novo comentário a uma tarefa no Perfex CRM.',
            inputSchema: {
                type: 'object',
                properties: {
                    taskId: { type: ['string', 'number'], description: 'ID da tarefa' },
                    comment: { type: 'string', description: 'Conteúdo do comentário' }
                },
                required: ['taskId', 'comment']
            }
        },
        {
            name: 'perfex_toggle_task_timer',
            description: 'Iniciar ou pausar o cronômetro de contagem de tempo de uma tarefa no Perfex CRM.',
            inputSchema: {
                type: 'object',
                properties: {
                    taskId: { type: ['string', 'number'], description: 'ID da tarefa' },
                    action: { type: 'string', enum: ['start', 'pause'], description: 'Ação do cronômetro: start ou pause' },
                    timerId: { type: 'string', description: 'ID opcional do cronômetro para pausar' }
                },
                required: ['taskId', 'action']
            }
        },
        {
            name: 'perfex_update_task_status',
            description: 'Alterar o status de uma tarefa no Perfex CRM.',
            inputSchema: {
                type: 'object',
                properties: {
                    taskId: { type: ['string', 'number'], description: 'ID da tarefa' },
                    statusId: { type: ['number', 'string'], description: 'ID do novo status (1: Não Iniciado, 4: Em Progresso, 100: Em Homologação, 3: Em Teste, 2: Aguardando Feedback, 5: Completo, 101: Backlog)' }
                },
                required: ['taskId', 'statusId']
            }
        }
    ];
}

export function getPerfexTools() {
    return [
        ...getProjectTools(),
        ...getTaskReadTools(),
        ...getTaskActionTools()
    ];
}
