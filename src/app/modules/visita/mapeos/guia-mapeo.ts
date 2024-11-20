export const guiaMapeo: any = {
    modulo: "general",
    modelo: "guia",
    tipo: "Administrador",
    datos: [
      {
        nombre: "guia",
        campoTipo: "IntegerField",
        visibleTabla: true,
        visibleFiltro: true,
        ordenable: true,
      },
      {
        nombre: "fecha",
        campoTipo: "DateField",
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
  