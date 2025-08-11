import { FilterField } from "../../../core/interfaces/filtro.interface";

export const DESPACHO_LISTA_FILTERS: FilterField[] = [
  { name: 'id', displayName: 'id', type: 'number' },
  { name: 'vehiculo__placa', displayName: 'Placa', type: 'string' },
  { name: 'estado_aprobado', displayName: 'Aprobado', type: 'boolean' },
  { name: 'estado_terminado', displayName: 'Terminado', type: 'boolean' },
];
