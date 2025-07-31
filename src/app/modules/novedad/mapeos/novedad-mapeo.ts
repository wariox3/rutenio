import { FilterField } from "../../../core/interfaces/filtro.interface";

export const novedadMapeo: any = {
  modulo: 'general',
  modelo: 'guia',
  tipo: 'Administrador',
  datos: [
    {
      nombre: 'ID',
      campoNombre: 'Id',
      campoTipo: 'IntegerField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },
    {
      nombre: 'estado_solucion',
      campoNombre: 'Solucionado',
      campoTipo: 'Booleano',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: false,
    },
  ],
};



export const NOVEDAD_FILTERS: FilterField[] = [
  { name: 'id', displayName: 'Id', type: 'number' },
  { name: 'estado_solucion', displayName: 'Solucionado', type: 'boolean' },
];
