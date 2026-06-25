/** Form, layout, permission, and UI view types. */

export type TableLayout = {
  columns: string[];
  columnWidths: Record<string, number>;
  defaultSort: { column: string; direction: 'asc' | 'desc' };
  hiddenColumns: string[];
  frozenColumns: string[];
};
export type ColumnLayout = {
  align: 'left' | 'right' | 'center';
  format: string;
  editable: boolean;
};
export type TableFeatures = {
  enablePagination: boolean;
  enableSearch: boolean;
  enableExport: boolean;
  enableFilters: boolean;
  rowsPerPage: number;
  allowedActions: string[];
};
export type ColumnFeatures = {
  searchable: boolean;
  sortable: boolean;
  filterable: boolean;
  required: boolean;
  validation?: string;
};
export type ComponentLayout = { [key: string]: any };
export type FormField = {
  name: string;
  type:
    | 'text' | 'email' | 'number' | 'textarea'
    | 'select' | 'checkbox' | 'date' | 'datetime';
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: string;
  prefix?: string;
  suffix?: string;
};
export type FormSchema = {
  fields: FormField[];
  submitLabel: string;
  cancelLabel: string;
};
export type ValidationRule = { pattern: string; message: string };
export type Permissions = {
  create?: string[];
  read?: string[];
  update?: string[];
  delete?: string[];
};
export type Relationships = {
  hasMany?: string[];
  belongsTo?: string[];
  hasOne?: string[];
  belongsToMany?: string[];
};
export type UiView = {
  component: string;
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  showRelated?: boolean;
  tabs?: string[];
  redirect?: string;
};

export * from './componentNodeTypes';
