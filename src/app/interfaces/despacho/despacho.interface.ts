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
  entrega_id: number;
  estado_aprobado: boolean;
  estado_terminado: boolean;
  codigo_complemento: number;
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
  entrega_id: 0,
  estado_aprobado: false,
  estado_terminado: false,
  codigo_complemento: 0
};
