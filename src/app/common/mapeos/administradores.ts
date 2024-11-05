export const mapeo: any = {
  Vehiculo: {
    modulo: 'general',
    modelo: 'vehiculo',
    tipo: 'Administrador',
    datos: [
      {
        nombre: 'ID',
        campoNombre: 'id',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'Placa',
        campoNombre: 'placa',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'Capacidad',
        campoNombre: 'capacidad',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: "Activo",
        campoNombre: 'estado_activo',
        campoTipo: "Boolean",
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: "Asignado",
        campoNombre: 'estado_asignado',
        campoTipo: "Boolean",
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      }
    ],
  },
  Contacto: {
    
  }
};
