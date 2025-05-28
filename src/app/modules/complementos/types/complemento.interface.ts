export interface RespuestaComplemento {
  id: number;
  nombre: string;
  instalado: boolean;
  estructura_json: any[];
  datos_json: any;
}

export interface EstructuraJson {
  valor: string;
  nombre: string;
}

export interface DatosJson {
  url: string;
  clave: string;
  usuario: string;
}
