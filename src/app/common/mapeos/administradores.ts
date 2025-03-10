export const mapeo: any = {
  Vehiculo: {
    modulo: 'general',
    modelo: 'vehiculo',
    tipo: 'Administrador',
    datos: [
      {
        encabezado: 'ID',
        campoNombre: 'id',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        encabezado: 'Placa',
        campoNombre: 'placa',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Capacidad',
        campoNombre: 'capacidad',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      // {
      //   encabezado: 'Volumen',
      //   campoNombre: 'volumen',
      //   campoTipo: 'CharField',
      //   visibleTabla: true,
      //   visibleFiltro: true,
      //   ordenable: true,
      // },
      {
        encabezado: 'Franja Código',
        campoNombre: 'franja_codigo',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        encabezado: 'Franja Nombre',
        campoNombre: 'franja_nombre',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: true,
      },
      {
        encabezado: 'Activo',
        campoNombre: 'estado_activo',
        campoTipo: 'Boolean',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        encabezado: 'Asignado',
        campoNombre: 'estado_asignado',
        campoTipo: 'Boolean',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
    ],
  },
  Contacto: {
    modulo: 'general',
    modelo: 'contacto',
    tipo: 'Administrador',
    datos: [
      {
        encabezado: 'ID',
        campoNombre: 'id',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        encabezado: 'Tipo',
        campoNombre: 'identificacion_abreviatura',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Identificación',
        campoNombre: 'numero_identificacion',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        encabezado: 'Digito verificación',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Nombre',
        campoNombre: 'nombre_corto',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        encabezado: 'Correo',
        campoNombre: 'correo',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Dirección',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'Nombre1',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Nombre2',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Apellido1',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Apellido2',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Código postal',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Teléfono',
        campoNombre: 'telefono',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Celular',
        campoNombre: 'celular',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Barrio',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Código ciuu',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Ciudad nombre',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Regimen',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        encabezado: 'Tipo persona',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
    ],
  },
};
