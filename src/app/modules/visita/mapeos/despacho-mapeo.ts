export const despachoMapeo: any = {
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
      nombre: 'vehiculo__placa',
      campoNombre: 'Placa',
      campoTipo: 'CharField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },
    {
      nombre: 'estado_aprobado',
      campoNombre: 'Aprobado',
      campoTipo: 'Booleano',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: false,
    },
    {
      nombre: 'estado_terminado',
      campoNombre: 'Terminado',
      campoTipo: 'Booleano',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: false,
    },
  ],
};
