export const visitaAdicionarMapeo: any = {
  modulo: 'general',
  modelo: 'guia',
  tipo: 'Administrador',
  datos: [
    {
      nombre: 'id',
      campoNombre: 'Id',
      campoTipo: 'IntegerField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },
    {
      nombre: 'numero',
      campoNombre: 'Número',
      campoTipo: 'IntegerField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },
    {
      nombre: 'despacho_id',
      campoNombre: 'Despacho',
      campoTipo: 'IntegerField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },
    {
      nombre: 'destinatario',
      campoNombre: 'Destinatario',
      campoTipo: 'CharField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },

    {
      nombre: 'documento',
      campoNombre: 'Documento',
      campoTipo: 'CharField',
      visibleTabla: true,
      visibleFiltro: true,
      ordenable: true,
    },
  ],
};
