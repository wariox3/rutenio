export interface TerminacionNovedad {
  numero: number | null;
  destinatario: string | null;
  tipo_novedad: string | null;
  descripcion: string | null;
  fecha: string | null;
}

// Consolidado del viaje que devuelve terminar-preview (y que se congela al cerrar).
export interface TerminacionPreview {
  despacho_id: number;
  consecutivo: number | null; // nº de Orden de Entrega (OE)
  agencia: string | null; // contenedor
  placa: string | null;
  conductor_id: number | null;
  conductor_nombre: string | null;
  fecha_viaje: string | null;
  fecha_salida: string | null;
  total_guias: number;
  entregadas: number;
  con_novedad: number;
  porcentaje: number;
  detalle_novedades: TerminacionNovedad[];
}
