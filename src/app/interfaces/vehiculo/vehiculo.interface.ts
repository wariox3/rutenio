export interface Vehiculo {}

export interface ListaVehiculo {
  id: number;
  placa: string;
  capacidad: number;
  franja_codigo: string;
  franja_nombre: string;
  estado_activo: boolean;
  estado_asignado: boolean;
  tiempo: number;
  usuario_app: string;
}
