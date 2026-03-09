/**
 * Template domain interfaces
 * Used by template cards, lists, and detail pages
 */
export interface Template {
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    icon: string;
    color: string;
    category: TemplateCategory;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    workflows: Array<{
        id: string;
        name: string;
        description: string;
    }>;
    metadata: {
        featured: boolean;
        rating: number;
        downloads: number;
        author: string;
        createdAt: string;
        updatedAt: string;
    };
}
export type TemplateCategory = 'automation' | 'analytics' | 'integration' | 'development' | 'marketing' | string;
export interface TemplateStats {
    totalTemplates: number;
    totalDownloads: number;
    averageRating: number;
}
export interface TemplateCategoryInfo {
    id: TemplateCategory;
    name: string;
    icon: string;
    templateCount: number;
}
//# sourceMappingURL=templates.d.ts.map