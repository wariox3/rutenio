export interface RespuestaAutocompletar<T> {
  registros: T[];
}

export interface AutocompletarCiudades {
  id: number;
  nombre: string;
  estado_nombre: string;
}

export interface AutocompletarTipoPersona {
  id: number;
  nombre: string;
}

export interface AutocompletarIdentificacion {
  id: number;
  nombre: string;
}

export interface AutocompletarRegimen {
  id: number;
  nombre: string;
}

export interface AutocompletarPlazoPagos {
  id: number;
  nombre: string;
  dias: number;
}

export interface AutocompletarFranja {
  id: number;
  nombre: string;
  codigo: number;
}

export interface AutocompletarTipoNovedad {
  id: number;
  nombre: string;
}
