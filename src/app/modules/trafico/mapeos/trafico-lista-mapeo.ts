import { FilterField } from "../../../core/interfaces/filtro.interface";

export const TRAFICO_LISTA_FILTERS: FilterField[] = [
  { name: 'entrega_id', displayName: 'orden entrega', type: 'number' },
  { name: 'vehiculo__placa', displayName: 'placa', type: 'string' },
  { name: 'fecha', displayName: 'fecha', type: 'date' },
];
