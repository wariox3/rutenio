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
  longitud: number;
  orden: number;
  distancia_proxima: number;
  franja_id: number;
  franja_codigo: any;
  franja_nombre: string;
  numero: number;
  tiempo_servicio: number;
  estado_decodificado_alerta: boolean;
  estado_despacho: boolean;
  destinatario_direccion_formato: string;
}
