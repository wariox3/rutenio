export interface EntregaEmpresa {
  contenedor_id: number;
  schema_name: string;
  nombre: string;
  fecha_ultima_conexion: string | null;
  decodificadas: number;
  whatsapp_enviados: number;
  total_despachos: number;
  visitas: number;
  visitas_entregadas: number;
  visitas_novedad: number;
  unidades: number;
  peso: number;
  volumen: number;
}

export interface AdminEntregasTotales {
  decodificadas: number;
  whatsapp_enviados: number;
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

export interface DespachoDetalle {
  id: number;
  fecha: string;
  fecha_salida: string | null;
  vehiculo__placa: string;
  visitas: number;
  visitas_entregadas: number;
  visitas_novedad: number;
  visitas_liberadas: number;
  unidades: number;
  peso: number;
  volumen: number;
  estado_terminado: boolean;
  tiempo_servicio: number;
  tiempo_trayecto: number;
  visitas_detalle: VisitaDetalle[];
}

export interface VisitaDetalle {
  id: number;
  numero: number;
  documento: string;
  destinatario: string;
  destinatario_direccion: string;
  destinatario_telefono: string;
  unidades: number;
  peso: number;
  estado_entregado: boolean;
  estado_novedad: boolean;
  estado_decodificado: boolean;
  orden: number;
  datos_entrega: any;
}

export interface AdminEntregasDetalleRespuesta {
  empresa: {
    contenedor_id: number;
    schema_name: string;
    nombre: string;
  };
  despachos: DespachoDetalle[];
}
