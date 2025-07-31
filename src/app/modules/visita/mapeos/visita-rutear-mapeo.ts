import { FilterField } from "../../../core/interfaces/filtro.interface";

export const VISITA_RUTEAR_FILTERS: FilterField[] = [
  { name: 'numero', displayName: 'Número', type: 'number' },
  { name: 'franja_id', displayName: 'Franja', type: 'string' },
  { name: 'estado_decodificado', displayName: 'Decodificado', type: 'boolean' },
  { name: 'estado_decodificado_alerta', displayName: 'Alerta', type: 'boolean' },
];
