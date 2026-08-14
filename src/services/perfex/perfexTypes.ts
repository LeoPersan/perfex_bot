export interface PerfexAuthConfig {
    baseUrl?: string;
    csrfToken: string;
    sessionCookie: string;
}

export interface PerfexProject {
    id: string;
    name: string;
    client: string;
    startDate: string;
    deadline: string;
    statusId: string;
    status: string;
}

export interface PerfexProjectDetails extends PerfexProject {
    description: string;
    members: string[];
    loggedTime?: string;
    openTasks?: number;
    totalTasks?: number;
    progressPercentage?: string;
}

export interface PerfexTask {
    id: string;
    title: string;
    statusId: string;
    status: string;
    dueDate: string;
    startDate?: string;
    assignees: string[];
    priority: string;
    isTimerActive: boolean;
    activeTimerId: string | null;
    loggedTime: string | null;
    relType?: string;
    relId?: string;
    relName?: string;
}

export interface PerfexTaskComment {
    id: string;
    author: string;
    authorId?: string;
    date: string;
    contentMarkdown: string;
}

export interface PerfexChecklistItem {
    id: string;
    description: string;
    finished: boolean;
}

export interface PerfexTaskDetails extends PerfexTask {
    descriptionMarkdown: string;
    followers: string[];
    checklistItems: PerfexChecklistItem[];
    comments: PerfexTaskComment[];
}

export interface PerfexListProjectsFilter {
    statusId?: string | number;
    name?: string;
    code?: string | number;
}

export interface PerfexListTasksFilter {
    projectId?: string | number;
    statusId?: string | number;
    code?: string | number;
    name?: string;
    assignee?: string;
    allTasks?: boolean;
}

export interface PerfexMutationResult {
    success: boolean;
    message: string;
    taskHtml?: string;
    commentId?: string;
    activeTimerId?: string | null;
}
