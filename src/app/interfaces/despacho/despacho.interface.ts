export interface Despacho {
  id: number;
  fecha: string;
  peso: number;
  volumen: number;
  visitas: number;
  vehiculo_id: number;
  vehiculo_placa: string;
  estado_aprobado: boolean;
  tiempo: number;
  tiempo_trayecto: number;
  tiempo_servicio: number;
}
