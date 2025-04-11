export interface TipoIdentificacion {
  identificacion_id: number;
  identificacion_nombre: string;
}

export interface TipoIdentificacionLista {
  registros: TipoIdentificacion[]
}
