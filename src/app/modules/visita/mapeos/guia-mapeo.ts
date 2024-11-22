export const guiaMapeo: any = {
  modulo: 'general',
  modelo: 'guia',
  tipo: 'Administrador',
  datos: [
    {
      nombre: 'numero',
      campoNombre: 'Número',
      campoTipo: 'IntegerField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },
    {
      nombre: 'fecha',
      campoTipo: 'DateField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: false,
    },
    {
      nombre: 'estado_despacho',
      campoNombre: 'Despachado',
      campoTipo: 'Booleano',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: false,
    },
    {
      nombre: 'estado_decodificado',
      campoNombre: 'Decodificado',
      campoTipo: 'Booleano',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: false,
    },
    {
      nombre: 'estado_decodificado_alerta',
      campoNombre: 'Alerta',
      campoTipo: 'Booleano',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: false,
    },
    // {
    //   nombre: "ciudad",
    //   campoTipo: "Fk",
    //   visibleTabla: true,
    //   visibleFiltro: true,
    //   ordenable: true,
    //   esFk: true,
    //   modeloFk: 'GenCiudad'
    // }
  ],
};
