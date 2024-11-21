type Mapeo = {
    [key: string]: {
      nombre: string;
      campoNombre?: string;
      visibleTabla: boolean;
      visibleFiltro: boolean;
      ordenable: boolean;
      campoTipo:
        | 'IntegerField'
        | 'FloatField'
        | 'CharField'
        | 'DateField'
        | 'Booleano';
    }[];
  };
  
  export const mapeoAvanzado: Mapeo = {
    GenContacto: [
      {
        nombre: 'ID',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'IDENTIFICACION_ABREVIATURA',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'NUMERO_IDENTIFICACION',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'DIGITO_VERIFICACION',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'NOMBRE_CORTO',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'CORREO',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'DIRECCION',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'NOMBRE1',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'NOMBRE2',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'APELLIDO1',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'APELLIDO2',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'CODIGO_POSTAL',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'TELEFONO',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'CELULAR',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'BARRIO',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'CODIGO_CIUU',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'CIUDAD_NOMBRE',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'REGIMEN_NOMBRE',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
      {
        nombre: 'TIPO_PERSONA',
        campoTipo: 'CharField',
        visibleTabla: false,
        visibleFiltro: false,
        ordenable: false,
      },
    ],
    GenItem: [
      {
        nombre: 'ID',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'NOMBRE',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
    ],
    ConGrupo: [
      {
        nombre: 'ID',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'NOMBRE',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
    ],
    HumGrupo: [
      {
        nombre: 'ID',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'NOMBRE',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
    ],
    GenCiudad: [
      {
        nombre: 'ID',
        campoTipo: 'IntegerField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: 'Nombre',
        campoTipo: 'CharField',
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
    ],
  };
  