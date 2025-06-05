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