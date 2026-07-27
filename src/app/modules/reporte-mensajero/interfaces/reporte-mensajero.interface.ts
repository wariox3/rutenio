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

// Relación guía por guía con la zona (franja) donde cae la entrega. La zona es
// factor de pago del mensajero.
export interface EntregaZona {
  id: number;
  fecha: string | null;
  fecha_entrega: string | null;
  despacho_id: number;
  conductor_id: number | null;
  conductor_nombre: string | null;
  placa: string | null;
  numero: number | null;
  documento: string | null;
  destinatario: string | null;
  destinatario_direccion: string | null;
  zona_id: number | null;
  zona_codigo: string | null;
  zona_nombre: string | null;
  estado: 'entregada' | 'novedad' | 'pendiente';
}

// Conteo por (mensajero × zona): lo que alimenta el pago.
export interface ResumenZona {
  conductor_id: number | null;
  conductor_nombre: string | null;
  placa: string | null;
  zona_id: number | null;
  zona_codigo: string | null;
  zona_nombre: string | null;
  asignadas: number;
  entregadas: number;
  novedades: number;
}

export interface ReporteEntregasZonaRespuesta {
  relacion: EntregaZona[];
  relacion_count: number;
  truncado: boolean;
  resumen: ResumenZona[];
}
