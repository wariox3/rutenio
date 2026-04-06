export interface EntregaEmpresa {
  contenedor_id: number;
  schema_name: string;
  nombre: string;
  total_despachos: number;
  visitas: number;
  visitas_entregadas: number;
  visitas_novedad: number;
  unidades: number;
  peso: number;
  volumen: number;
}

export interface AdminEntregasTotales {
  total_despachos: number;
  visitas: number;
  visitas_entregadas: number;
  visitas_novedad: number;
  unidades: number;
  peso: number;
  volumen: number;
}

export interface AdminEntregasRespuesta {
  resultados: EntregaEmpresa[];
  totales: AdminEntregasTotales;
}
