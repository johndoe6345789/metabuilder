/**
 * Mock for @metabuilder/components and deep @/../../../components/* imports.
 * Provides lightweight stubs for all exported components.
 */

import React from 'react';

// Layout components
export const AuthFormLayout = ({ children, title, subtitle, footerText, footerLinkHref, footerLinkText }: any) => (
  <div data-testid="auth-layout">
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
    {children}
    {footerText && (
      <div>
        {footerText} <a href={footerLinkHref}>{footerLinkText}</a>
      </div>
    )}
  </div>
);

// Feedback components
export const NotFoundState = ({ errorCode, title, description, primaryActionText, primaryActionHref, secondaryActionText, secondaryActionHref }: any) => (
  <div data-testid="not-found-state">
    <span>{errorCode}</span>
    <h1>{title}</h1>
    <p>{description}</p>
    <a href={primaryActionHref}>{primaryActionText}</a>
    {secondaryActionText && <a href={secondaryActionHref}>{secondaryActionText}</a>}
  </div>
);

export const PasswordStrengthIndicator = ({ password, strength, message, hint }: any) => (
  <div data-testid="password-strength">
    <span data-strength={strength}>{message}</span>
    {hint && <small>{hint}</small>}
  </div>
);

// Workflow editor
export const WorkflowEditor = ({ workflow, onChange }: any) => (
  <div data-testid="workflow-editor">{workflow?.name}</div>
);

// Card components
export const TemplateCard = ({ template }: any) => (
  <div data-testid={`template-card-${template?.id}`}>{template?.name}</div>
);

export const TemplateListItem = ({ template }: any) => (
  <div data-testid={`template-list-${template?.id}`}>{template?.name}</div>
);

export const ProjectCard = ({ project }: any) => (
  <div data-testid={`project-card-${project?.id}`}>{project?.name}</div>
);

// Workflow editor exports
export type Position = { x: number; y: number };
export type Workflow = {
  id: string; name: string; description: string;
  nodes: any[]; connections: any[];
  createdAt: string; updatedAt: string;
};
export type WorkflowNode = {
  id: string; type: string; name: string;
  position: Position; config: Record<string, unknown>;
  inputs: any[]; outputs: any[];
};
export type NodeType = {
  id: string; name: string; defaultConfig: Record<string, unknown>;
  inputs: any[]; outputs: any[];
};
export const generateConnectionId = () => `conn-${Math.random().toString(36).slice(2)}`;
export const generateNodeId = () => `node-${Math.random().toString(36).slice(2)}`;
export const Position = { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' };

// Generic fallback
export default {};
