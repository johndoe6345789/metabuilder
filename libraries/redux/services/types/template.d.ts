/**
 * Project Template Type Definitions
 * Types for pre-built project templates with starter workflows
 */
/**
 * Template workflow - minimal workflow definition for templates
 */
export interface TemplateWorkflow {
    name: string;
    description: string;
    nodes: Array<{
        id: string;
        type: string;
        label?: string;
    }>;
    connections?: Array<{
        source: string;
        target: string;
    }>;
}
/**
 * Project Template - reusable project blueprint with starter workflows
 */
export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    category: TemplateCategory;
    icon: string;
    color: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    workflows: TemplateWorkflow[];
    metadata: {
        author: string;
        version: string;
        createdAt: number;
        updatedAt: number;
        downloads?: number;
        rating?: number;
        featured?: boolean;
    };
    preview?: {
        thumbnail?: string;
        banner?: string;
        description: string;
    };
}
/**
 * Template Category - classification for templates
 */
export type TemplateCategory = 'automation' | 'data-processing' | 'integration' | 'monitoring' | 'reporting' | 'communication' | 'content' | 'ecommerce' | 'finance' | 'crm' | 'hr' | 'custom';
/**
 * Template Filter Options
 */
export interface TemplateFilters {
    category?: TemplateCategory | TemplateCategory[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    featured?: boolean;
    searchQuery?: string;
    tags?: string[];
}
/**
 * Template Creation Request
 */
export interface CreateProjectFromTemplateRequest {
    templateId: string;
    projectName: string;
    projectDescription?: string;
    workspaceId: string;
    customizeWorkflows?: boolean;
}
/**
 * Template Usage Statistics
 */
export interface TemplateStats {
    templateId: string;
    totalCreated: number;
    averageCompletionTime?: number;
    userRatings?: {
        average: number;
        count: number;
    };
    tags: string[];
    lastUsed?: number;
}
/**
 * Template Category with metadata
 */
export interface TemplateCategoryInfo {
    id: TemplateCategory;
    name: string;
    description: string;
    icon: string;
    color: string;
    templateCount: number;
}
//# sourceMappingURL=template.d.ts.map