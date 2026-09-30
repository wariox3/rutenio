export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
  displayValue?: string;
  multiple?: boolean;
}

export interface FilterField {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'relation';
  relationConfig?: RelationConfig;
}

export interface RelationConfig {
  endpoint: string;
  valueField: string; // usualmente el ID
  displayField: string;
  searchField?: string; // si no se define, usa 'search'
  queryParams?: { [key: string]: any };
  multiple?: boolean;
  preload?: boolean; // precarga las opciones al inicializar el componente
}

export interface Operator {
  symbol: string;
  name: string;
  types: FilterField['type'][];
  default: boolean;
}
