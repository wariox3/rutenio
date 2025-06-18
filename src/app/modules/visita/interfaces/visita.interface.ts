export interface Visita {
  id: number;
  guia: number;
  fecha: string;
  documento: string;
  destinatario: string;
  destinatario_direccion: string;
  ciudad_id: number;
  destinatario_telefono: string;
  destinatario_correo: any;
  peso: number;
  volumen: number;
  estado_decodificado: boolean;
  latitud: number;
  estado_entregado: boolean;
  longitud: number;
  orden: number;
  distancia_proxima: number;
  franja_id: number;
  franja_codigo: any;
  franja_nombre: string;
  numero: number;
  tiempo: number;
  tiempo_servicio: number;
  tiempo_trayecto: number;
  estado_decodificado_alerta: boolean;
  estado_despacho: boolean;
  estado_novedad: boolean;
  destinatario_direccion_formato: string;
  resultados: any[];
  datos_entrega: {
    recibe: string;
    recibeCelular: string;
    recibeParentesco: string;
    recibeNumeroIdentificacion: string;
  };
}
