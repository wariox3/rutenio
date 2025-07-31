import { FilterField } from "../../../core/interfaces/filtro.interface";

export const DESPACHO_ADICIONAR_VISITA_PENDIENTE_FILTERS: FilterField[] = [
  { name: 'id', displayName: 'Id', type: 'number' },
  { name: 'numero', displayName: 'Número', type: 'number' },
  { name: 'destinatario', displayName: 'Destinatario', type: 'string' },
  { name: 'documento', displayName: 'Documento', type: 'string' },
];
