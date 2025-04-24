export interface RespuestaAutocompletar<T> {
    registros: T[];
  }
  
  export interface AutocompletarCiudades {
    id: number;
    nombre: string;
    estado_nombre: string;
  }
  
  export interface AutocompletarTipoPersona {
    tipo_persona_id: number;
    tipo_persona_nombre: string;
  }
  
  export interface AutocompletarIdentificacion {
    identificacion_id: number;
    identificacion_nombre: string;
  }
  
  export interface AutocompletarRegimen {
    regimen_id: number;
    regimen_nombre: string;
  }
  
  export interface AutocompletarPlazoPagos {
    plazo_pago_id: number;
    plazo_pago_nombre: string;
    plazo_dias: number;
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
  