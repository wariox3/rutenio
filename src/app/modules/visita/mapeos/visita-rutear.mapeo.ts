export const visitaRutearMapeo: any = {
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
      nombre: 'franja__id',
      campoNombre: 'Franja',
      campoTipo: 'IntegerField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
      esFk: true,
      modeloFk: 'RutFranja',
    },
  ],
};
