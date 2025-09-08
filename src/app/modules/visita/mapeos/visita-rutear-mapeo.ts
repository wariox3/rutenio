import { FilterField } from "../../../core/interfaces/filtro.interface";

export const VISITA_RUTEAR_FILTERS: FilterField[] = [
  { name: 'numero', displayName: 'Número', type: 'number' },
  {
    name: 'franja_id', displayName: 'Franja', type: 'relation', relationConfig: {
      preload: true,
      endpoint: 'ruteo/franja/seleccionar/',
      valueField: 'id',
      displayField: 'nombre',
      searchField: 'nombre__icontains',
      queryParams: {
        limit: 100,
      },
      multiple: true
    }
  },
  { name: 'estado_decodificado', displayName: 'Decodificado', type: 'boolean' },
  { name: 'estado_decodificado_alerta', displayName: 'Alerta', type: 'boolean' },
];
