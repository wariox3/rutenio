export interface DashboardFiltros {
  fechaDesde: string;
  fechaHasta: string;
  ciudad: string;
  cliente: string;
  tipoVehiculo: string;
}

export interface KpiIndicador {
  titulo: string;
  descripcion?: string;
  detalleAyuda?: string;
  valor: number;
  unidad: string;
  comparacionAnterior?: number;
  meta?: number;
  subIndicadores?: { etiqueta: string; valor: number; icono?: string; color?: string }[];
}

export interface CumplimientoZona {
  zona: string;
  descripcion?: string;
  sla: number;
  color: string;
  estado: 'ok' | 'alerta' | 'critico';
}

export interface MarcadorMapa {
  lat: number;
  lng: number;
  tipo: 'entrega' | 'incidencia';
  titulo?: string;
}
