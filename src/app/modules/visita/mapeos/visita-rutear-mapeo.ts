import { FilterField } from "../../../core/interfaces/filtro.interface";

export const VISITA_RUTEAR_FILTERS: FilterField[] = [
  { name: 'numero', displayName: 'Número', type: 'number' },
  {
    name: 'franja_id', displayName: 'Franja multiple', type: 'relation', relationConfig: {
      endpoint: 'general/documento_tipo/seleccionar/',
      valueField: 'id',
      displayField: 'nombre',
      searchField: 'nombre__icontains',
      queryParams: {
        documento_clase_id: 701,
      },
      multiple: true
    }
  },
  { name: 'estado_decodificado', displayName: 'Decodificado', type: 'boolean' },
  { name: 'estado_decodificado_alerta', displayName: 'Alerta', type: 'boolean' },
];
