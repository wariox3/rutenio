export interface Vehiculo {
  id: number;
  placa: string;
  capacidad: number;
  franja_codigo: string;
  franja_nombre: string;
  estado_activo: boolean;
  estado_asignado: boolean;
  tiempo: number;
  usuario_app: string;
  prioridad: number;
}

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
  prioridad: number;
}

export const vehiculoEmpty: Vehiculo = {
  id: 0,
  placa: '',
  capacidad: 0,
  franja_codigo: '',
  franja_nombre: '',
  estado_activo: false,
  estado_asignado: false,
  tiempo: 0,
  usuario_app: '',
  prioridad: 0
};
