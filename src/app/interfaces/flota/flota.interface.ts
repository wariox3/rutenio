import { ListaFranja } from "../vehiculo/vehiculo.interface";

export interface Flota {}

export interface ListaFlota {
  id: number;
  prioridad: number | null;
  vehiculo_placa: string;
  vehiculo_capacidad: number;
  vehiculo_id: number;
  vehiculo_franja_codigo: string;
  vehiculo_tiempo: number;
  vehiculo_estado_asignado: boolean;
  vehiculo_prioridad: number;
  vehiculo_franjas: ListaFranja[];
}


