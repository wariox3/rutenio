import { FilterField } from "../../../core/interfaces/filtro.interface";

export const VISITA_LISTA_FILTERS: FilterField[] = [
  { name: 'id', displayName: 'id', type: 'number' },
  { name: 'numero', displayName: 'Número', type: 'number' },
  { name: 'destinatario', displayName: 'Destinatario', type: 'string' },
  { name: 'fecha', displayName: 'fecha', type: 'date' },
  { name: 'despacho_id', displayName: 'Despacho', type: 'number' },
  { name: 'estado_despacho', displayName: 'Despachado', type: 'boolean' },
  { name: 'estado_decodificado', displayName: 'Decodificado', type: 'boolean' },
  {
    name: 'estado_decodificado_alerta', displayName: 'Alerta', type: 'boolean'
  },
];
