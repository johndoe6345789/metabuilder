/** ComponentNode, PropDefinition, and ComponentPropSchema types. */

export type ComponentNode = {
  component: string;
  props?: Record<string, any>;
  children?: ComponentNode[];
  condition?: string;
  forEach?: string;
  dataSource?: string;
  comment?: string;
};

export type ComponentTree = ComponentNode;

export type PropDefinition = {
  type:
    | 'string' | 'number' | 'boolean' | 'array'
    | 'object' | 'function' | 'enum' | 'any';
  description: string;
  required?: boolean;
  default?: any;
  values?: any[];
};

export type ComponentPropSchema = {
  description: string;
  category:
    | 'inputs' | 'display' | 'layout' | 'navigation' | 'feedback';
  props: Record<string, PropDefinition>;
};
