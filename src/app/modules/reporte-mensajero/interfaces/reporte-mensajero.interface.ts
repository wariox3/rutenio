export interface FilaReporteMensajero {
  conductorId: number | null;
  conductorNombre: string;
  fecha: string;
  despachos: number;
  asignadas: number;
  entregadas: number;
  novedades: number;
  cumplimiento: number;
}

export interface TotalMensajero {
  conductorId: number | null;
  conductorNombre: string;
  dias: number;
  despachos: number;
  asignadas: number;
  entregadas: number;
  novedades: number;
  cumplimiento: number;
}
