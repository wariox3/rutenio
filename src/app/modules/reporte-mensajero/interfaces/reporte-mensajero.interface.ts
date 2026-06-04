export interface FilaReporteMensajero {
  conductorId: number | null;
  conductorNombre: string;
  placa: string;
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

export interface TotalPlaca {
  placa: string;
  dias: number;
  despachos: number;
  asignadas: number;
  entregadas: number;
  novedades: number;
  cumplimiento: number;
}
