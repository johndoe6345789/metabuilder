/**
 * useNodeTypes Hook
 * Dynamically loads and manages node type definitions from workflow plugins
 * Fetches from /api/plugins endpoint with language grouping support
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

export interface NodeTypeDefinition {
  id: string;
  type: string;
  category: string;
  categoryName?: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  inputs: string[];
  outputs: string[];
  defaultConfig: Record<string, unknown>;
  language?: string;
}

export interface NodeCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface UseNodeTypesReturn {
  // State
  nodeTypes: NodeTypeDefinition[];
  categories: Record<string, NodeCategory>;
  isLoading: boolean;
  error: string | null;

  // Language grouping
  languages: string[];
  nodesByLanguage: Record<string, NodeTypeDefinition[]>;
  languageHealth: Record<string, boolean>;
  selectedLanguage: string | null;
  setSelectedLanguage: (lang: string | null) => void;

  // Search and filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredNodeTypes: NodeTypeDefinition[];

  // Category operations
  expandedCategories: Record<string, boolean>;
  toggleCategory: (categoryId: string) => void;
  expandAllCategories: () => void;
  collapseAllCategories: () => void;

  // Queries
  getNodeType: (typeId: string) => NodeTypeDefinition | undefined;
  getNodeTypesByCategory: (categoryId: string) => NodeTypeDefinition[];

  // Dynamic loading
  registerNodeType: (nodeType: NodeTypeDefinition) => void;
  registerNodeTypes: (nodeTypes: NodeTypeDefinition[]) => void;
  unregisterNodeType: (typeId: string) => void;
  refreshFromAPI: () => Promise<void>;
}

export interface UseNodeTypesOptions {
  initialNodeTypes?: NodeTypeDefinition[];
  initialCategories?: Record<string, NodeCategory>;
  autoExpandCategories?: boolean;
  loadFromAPI?: boolean;
  apiEndpoint?: string;
}

// Default categories matching n8n style (fallback if API unavailable)
const DEFAULT_CATEGORIES: Record<string, NodeCategory> = {
  triggers: { id: 'triggers', name: 'Triggers', color: '#ff6b6b', icon: 'zap' },
  actions: { id: 'actions', name: 'Actions', color: '#4ecdc4', icon: 'play' },
  logic: { id: 'logic', name: 'Logic', color: '#45b7d1', icon: 'git-branch' },
  math: { id: 'math', name: 'Math', color: '#f39c12', icon: 'calculator' },
  string: { id: 'string', name: 'String', color: '#9b59b6', icon: 'type' },
  data: { id: 'data', name: 'Data', color: '#96ceb4', icon: 'database' },
  integrations: { id: 'integrations', name: 'Integrations', color: '#dda0dd', icon: 'plug' },
  utils: { id: 'utils', name: 'Utilities', color: '#ffeaa7', icon: 'tool' },
  ai: { id: 'ai', name: 'AI', color: '#e74c3c', icon: 'cpu' },
  backend: { id: 'backend', name: 'Backend', color: '#3498db', icon: 'server' },
};

// Minimal fallback node types (shown while loading or if API fails)
const FALLBACK_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: 'trigger.manual',
    type: 'triggers',
    category: 'triggers',
    name: 'Manual Trigger',
    icon: 'play',
    color: '#ff6b6b',
    description: 'Start workflow manually',
    inputs: [],
    outputs: ['main'],
    defaultConfig: {},
    language: 'ts',
  },
  {
    id: 'logic.if',
    type: 'logic',
    category: 'logic',
    name: 'If',
    icon: 'git-branch',
    color: '#45b7d1',
    description: 'Conditional branching',
    inputs: ['main'],
    outputs: ['true', 'false'],
    defaultConfig: { condition: '' },
    language: 'ts',
  },
];

export function useNodeTypes(options: UseNodeTypesOptions = {}): UseNodeTypesReturn {
  const {
    initialNodeTypes = FALLBACK_NODE_TYPES,
    initialCategories = DEFAULT_CATEGORIES,
    autoExpandCategories = false,
    loadFromAPI = true,
    apiEndpoint = '/api/plugins',
  } = options;

  const [nodeTypes, setNodeTypes] = useState<NodeTypeDefinition[]>(initialNodeTypes);
  const [categories, setCategories] = useState<Record<string, NodeCategory>>(initialCategories);
  const [isLoading, setIsLoading] = useState(loadFromAPI);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [nodesByLanguage, setNodesByLanguage] = useState<Record<string, NodeTypeDefinition[]>>({});
  const [languageHealth, setLanguageHealth] = useState<Record<string, boolean>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() =>
    Object.keys(initialCategories).reduce(
      (acc, key) => ({ ...acc, [key]: autoExpandCategories }),
      {}
    )
  );

  // Fetch plugins from API
  const refreshFromAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugins: ${response.statusText}`);
      }

      const data = await response.json();

      // Update categories from API
      if (data.categories && Array.isArray(data.categories)) {
        const categoryMap: Record<string, NodeCategory> = { ...DEFAULT_CATEGORIES };
        data.categories.forEach((cat: NodeCategory) => {
          categoryMap[cat.id] = cat;
        });
        setCategories(categoryMap);

        // Expand new categories
        setExpandedCategories((prev) => {
          const updated = { ...prev };
          data.categories.forEach((cat: NodeCategory) => {
            if (!(cat.id in updated)) {
              updated[cat.id] = autoExpandCategories;
            }
          });
          return updated;
        });
      }

      // Update node types from API
      if (data.nodes && Array.isArray(data.nodes)) {
        setNodeTypes(data.nodes);
      }

      // Update language grouping
      if (data.languages && Array.isArray(data.languages)) {
        setLanguages(data.languages);
      }

      if (data.nodesByLanguage && typeof data.nodesByLanguage === 'object') {
        setNodesByLanguage(data.nodesByLanguage);
      }

      // Update language health status
      if (data.languageHealth && typeof data.languageHealth === 'object') {
        setLanguageHealth(data.languageHealth);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plugins';
      setError(message);
      console.error('useNodeTypes: API fetch failed:', message);
      // Keep fallback nodes on error
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, autoExpandCategories]);

  // Load from API on mount
  useEffect(() => {
    if (loadFromAPI) {
      refreshFromAPI();
    }
  }, [loadFromAPI, refreshFromAPI]);

  // Filtered node types based on search and language
  const filteredNodeTypes = useMemo(() => {
    let filtered = nodeTypes;

    // Filter by language if selected
    if (selectedLanguage) {
      filtered = filtered.filter((n) => n.language === selectedLanguage);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.name.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query) ||
          (n.language && n.language.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [nodeTypes, searchQuery, selectedLanguage]);

  // Category operations
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }, []);

  const expandAllCategories = useCallback(() => {
    setExpandedCategories(
      Object.keys(categories).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
  }, [categories]);

  const collapseAllCategories = useCallback(() => {
    setExpandedCategories(
      Object.keys(categories).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
  }, [categories]);

  // Queries
  const getNodeType = useCallback(
    (typeId: string) => nodeTypes.find((n) => n.id === typeId),
    [nodeTypes]
  );

  const getNodeTypesByCategory = useCallback(
    (categoryId: string) => nodeTypes.filter((n) => n.category === categoryId),
    [nodeTypes]
  );

  // Dynamic registration
  const registerNodeType = useCallback((nodeType: NodeTypeDefinition) => {
    setNodeTypes((prev) => {
      const exists = prev.some((n) => n.id === nodeType.id);
      if (exists) {
        return prev.map((n) => (n.id === nodeType.id ? nodeType : n));
      }
      return [...prev, nodeType];
    });
  }, []);

  const registerNodeTypes = useCallback((newTypes: NodeTypeDefinition[]) => {
    setNodeTypes((prev) => {
      const merged = [...prev];
      newTypes.forEach((newType) => {
        const existingIndex = merged.findIndex((n) => n.id === newType.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = newType;
        } else {
          merged.push(newType);
        }
      });
      return merged;
    });
  }, []);

  const unregisterNodeType = useCallback((typeId: string) => {
    setNodeTypes((prev) => prev.filter((n) => n.id !== typeId));
  }, []);

  return {
    nodeTypes,
    categories,
    isLoading,
    error,
    languages,
    nodesByLanguage,
    languageHealth,
    selectedLanguage,
    setSelectedLanguage,
    searchQuery,
    setSearchQuery,
    filteredNodeTypes,
    expandedCategories,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    getNodeType,
    getNodeTypesByCategory,
    registerNodeType,
    registerNodeTypes,
    unregisterNodeType,
    refreshFromAPI,
  };
}
