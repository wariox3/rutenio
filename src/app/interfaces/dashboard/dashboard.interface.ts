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
  icono?: string;
  colorIcono?: string;
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

export interface DatoDiario {
  dia: string;
  entregas: number;
  sinNovedad: number;
}

export interface UtilizacionFlota {
  vehiculosActivos: number;
  vehiculosTotales: number;
  pesoTotal: number;
  capacidadTotal: number;
  porcentaje: number;
  entregas: number;
  sinNovedad: number;
  criticos: number;
}

export interface MarcadorMapa {
  lat: number;
  lng: number;
  tipo: 'entrega' | 'incidencia';
  titulo?: string;
}
