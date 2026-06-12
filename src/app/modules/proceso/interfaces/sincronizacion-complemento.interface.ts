import { Observable } from 'rxjs';

export interface SincronizacionFallida {
  id: number;
  numero: number;
  mensaje: string;
}

export interface SincronizacionRespuesta {
  mensaje: string;
  procesadas: number;
  fallidas: SincronizacionFallida[];
  sin_procesar?: number;
  descartadas?: number;
}

export interface SincronizacionResumen {
  pendientes: number;
  descartadas: number;
  lote: number;
}

export interface SincronizacionComplementoConfig {
  titulo: string;
  descripcion: string;
  unidad: string;
  obtenerResumen: () => Observable<SincronizacionResumen>;
  sincronizar: (
    reiniciarDescartadas: boolean
  ) => Observable<SincronizacionRespuesta>;
}
