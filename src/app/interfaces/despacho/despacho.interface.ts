export interface Despacho {
  id: number;
  fecha: string;
  estado?: 'tiempo' | 'retrazado';
  unidades: number;
  peso: number;
  volumen: number;
  visitas: number;
  visitas_entregadas: number;
  visitas_novedad: number;
  visitas_entregadas_esperadas: number;
  visitas_liberadas: number;
  vehiculo: number;
  vehiculo__placa: string;
  vehiculo__capacidad: number;
  conductor_id: number | null;
  conductor_nombre: string | null;
  conductor_telefono: string | null;
  estado_aprobado: boolean;
  tiempo: number;
  tiempo_trayecto: number;
  tiempo_servicio: number;
  fecha_salida: string;
  latitud: string;
  longitud: string;
  fecha_ubicacion: string;
  codigo_complemento: number;
  entrega_id: number;
  estado_terminado: boolean;
  // Trazabilidad "tomar por OE (self-service)": quién tomó la orden desde la app.
  cargado_por_id?: number | null;
  cargado_por_nombre?: string | null;
  cargado_en?: string | null;
}

export interface DespachoDetalle {
  id: number;
  fecha: string;
  fecha_salida: string;
  fecha_ubicacion: any;
  peso: number;
  volumen: number;
  tiempo: number;
  tiempo_servicio: number;
  tiempo_trayecto: number;
  visitas: number;
  visitas_entregadas: number;
  visitas_liberadas: number;
  vehiculo: number;
  vehiculo__placa: string;
  conductor_id: number | null;
  conductor_nombre: string | null;
  conductor_telefono: string | null;
  entrega_id: number;
  estado_aprobado: boolean;
  estado_terminado: boolean;
  codigo_complemento: number;
  // Trazabilidad "tomar por OE (self-service)": quién tomó la orden desde la app.
  cargado_por_id?: number | null;
  cargado_por_nombre?: string | null;
  cargado_en?: string | null;
}

export const despachoDetalleEmpty: DespachoDetalle = {
  id: 0,
  fecha: '',
  fecha_salida: '',
  fecha_ubicacion: null,
  peso: 0,
  volumen: 0,
  tiempo: 0,
  tiempo_servicio: 0,
  tiempo_trayecto: 0,
  visitas: 0,
  visitas_entregadas: 0,
  visitas_liberadas: 0,
  vehiculo: 0,
  vehiculo__placa: '',
  conductor_id: null,
  conductor_nombre: null,
  conductor_telefono: null,
  entrega_id: 0,
  estado_aprobado: false,
  estado_terminado: false,
  codigo_complemento: 0
};
