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
      nombre: 'franja_codigo',
      campoNombre: 'Franja',
      campoTipo: 'CharField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
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
  ],
};
