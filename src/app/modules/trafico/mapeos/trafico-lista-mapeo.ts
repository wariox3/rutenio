import { FilterField } from "../../../core/interfaces/filtro.interface";

export const TRAFICO_LISTA_FILTERS: FilterField[] = [
  { name: 'entrega_id', displayName: 'Orden Entrega', type: 'number' },
  { name: 'vehiculo__placa', displayName: 'Placa', type: 'string' },
  { name: 'fecha', displayName: 'Fecha', type: 'date' },
  // true = sin conductor asignado; false = asignadas (server-side, correcto con
  // paginación). Mismo patrón __isnull que "Sin cita" en visita-rutear.
  { name: 'conductor_id__isnull', displayName: 'Sin asignar', type: 'boolean' },
];
