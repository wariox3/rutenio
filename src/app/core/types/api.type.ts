export interface RespuestaLista<T> {
  registros: T;
  cantidad_registros: number;
}

export interface RespuestaApi<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export interface ParametrosApi {
  [key: string]: string | number;
}

export interface Autocompletar {
  id: number;
  nombre: string;
}

export interface EstadoPaginacion {
  paginaActual: number;
  itemsPorPagina: number;
  totalItems: number;
  totalPaginas?: number;
}

export interface ParametrosApiPost {
  operador: string;
  propiedad: string;
  valor1: string;
  valor2?: string;
}