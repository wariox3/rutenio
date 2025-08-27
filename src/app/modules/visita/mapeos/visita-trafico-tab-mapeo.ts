import { FilterField } from "../../../core/interfaces/filtro.interface";

export const VISITA_TRAFICO_TAB_FILTERS: FilterField[] = [
  { name: 'id', displayName: 'id', type: 'number' },
  { name: 'numero', displayName: 'Número', type: 'number' },
  { name: 'estado_entregado', displayName: 'Entregado', type: 'boolean' },
  { name: 'estado_novedad', displayName: 'Novedad', type: 'boolean' },
  { name: 'documento', displayName: 'Documento', type: 'string' },
  { name: 'numero', displayName: 'Número', type: 'number' },
];
