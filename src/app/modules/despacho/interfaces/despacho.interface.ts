export interface Despacho {
  id: number;
  fecha: string;
  estado: string;
  peso: number;
  volumen: number;
  visitas: number;
  visitas_entregadas: number;
  visitas_entregadas_esperadas : number;
  vehiculo_id: number;
  vehiculo_placa: string;
  estado_aprobado: boolean;
  tiempo: number;
  tiempo_trayecto: number;
  tiempo_servicio: number;
  fecha_salida: string;
}
