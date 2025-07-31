// filter.model.ts
export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
  displayValue?: string; // Added to store display text for relational fields
}

export interface FilterField {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'relation';
  relationConfig?: RelationConfig; // Configuration for relational fields
}

export interface RelationConfig {
  endpoint: string; // API endpoint to fetch related entities
  valueField: string; // Field to use as the value (usually ID)
  displayField: string; // Field to display to the user
  searchField?: string; // Field to use for searching (defaults to 'search' if not provided)
  queryParams?: { [key: string]: any }; // Optional query parameters for the API call
  multiple?: boolean; // Whether multiple selections are allowed
  preload?: boolean; // Whether to preload options on component init
}

export interface Operator {
  symbol: string;
  name: string;
  types: FilterField['type'][];
  default: boolean;
}