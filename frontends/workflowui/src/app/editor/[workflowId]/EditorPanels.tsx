/**
 * EditorPanels - NodePalette sidebar and PropertiesDialog for the editor
 */

'use client';

import React from 'react';
import {
  type NodeType,
  NodePalette,
  PropertiesDialog,
} from '@metabuilder/components/workflow-editor';
import type { WorkflowNode } from '@metabuilder/hooks';

interface EditorPanelsProps {
  nodeSearch: string;
  onSearchChange: (v: string) => void;
  expandedCategories: Record<string, boolean>;
  onToggleCategory: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDragStart: (e: React.DragEvent, nodeType: NodeType) => void;
  nodeTypes: NodeType[];
  categories: Record<
    string,
    { id: string; name: string; color: string }
  >;
  languages: string[];
  languageHealth: Record<string, boolean>;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  isLoading: boolean;
  propertiesDialogOpen: boolean;
  onPropertiesClose: () => void;
  selectedNode: WorkflowNode | null | undefined;
  selectedNodeType: NodeType | undefined;
  onUpdateConfig: (
    id: string,
    config: Record<string, unknown>
  ) => void;
  onUpdateName: (id: string, name: string) => void;
  onDeleteNode: (id: string) => void;
}

export default function EditorPanels({
  nodeSearch,
  onSearchChange,
  expandedCategories,
  onToggleCategory,
  onExpandAll,
  onCollapseAll,
  onDragStart,
  nodeTypes,
  categories,
  languages,
  languageHealth,
  selectedLanguage,
  onLanguageChange,
  isLoading,
  propertiesDialogOpen,
  onPropertiesClose,
  selectedNode,
  selectedNodeType,
  onUpdateConfig,
  onUpdateName,
  onDeleteNode,
}: EditorPanelsProps) {
  return (
    <>
      <NodePalette
        nodeSearch={nodeSearch}
        onSearchChange={onSearchChange}
        expandedCategories={expandedCategories}
        onToggleCategory={onToggleCategory}
        onExpandAll={onExpandAll}
        onCollapseAll={onCollapseAll}
        onDragStart={onDragStart}
        nodeTypes={nodeTypes}
        categories={categories}
        languages={languages}
        languageHealth={languageHealth}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        isLoading={isLoading}
      />

      <PropertiesDialog
        open={propertiesDialogOpen}
        onClose={onPropertiesClose}
        node={selectedNode}
        nodeType={selectedNodeType}
        onUpdateConfig={onUpdateConfig}
        onUpdateName={onUpdateName}
        onDelete={onDeleteNode}
      />
    </>
  );
}
