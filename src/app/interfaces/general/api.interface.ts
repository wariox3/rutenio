export interface RespuestaGeneralLista<T> {
    cantidad_registros: number;
    registros: T[];
  }
  
  export interface ParametrosConsulta {
      filtros: FiltrosAplicados[],
      limite: number;
      desplazar: number;
      ordenamientos: any,
      limite_conteo: number;
      modelo: string;
      serializador?: string
  }
  
  export interface Listafiltros {
    nombre: string;
    etiqueta: string;
    titulo: string;
    tipo: 'Texto' | 'Numero' | 'Booleano' | 'Fecha';
  }
  
  export interface FiltrosAplicados {
    id?: string;
    propiedad: string;
    operador?: string;
    valor1: string | boolean;
    valor2?: string | boolean;
    visualizarBtnAgregarFiltro?: boolean;
  }