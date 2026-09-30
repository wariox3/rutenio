export interface VisitaResumen {
  resumen: {
    unidades: number;
    cantidad: number;
    peso: number;
    tiempo_servicio: number;
    tiempo: number;
    tiempo_trayecto: number;
  };
  errores: {
    cantidad: number;
  };
  alertas: {
    cantidad: number;
  };
}

export interface ParametrosDireccionAlternativa {
  id: number;
  latitud: number;
  longitud: number;
  destinatario_direccion_formato: string;
}

export interface ParametrosActualizarDireccion {
  id: number;
  destinatario_direccion: string;
  numero: number;
  documento: string;
  destinatario: string;
  destinatario_telefono: string;
  destinatario_correo: string;
  peso: number;
  volumen: number;
}
