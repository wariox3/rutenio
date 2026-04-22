export type DireccionMensaje = 'in' | 'out';
export type TipoMensaje = 'texto' | 'imagen' | 'template' | 'audio' | 'documento' | 'ubicacion';
export type EstadoMensaje = 'pendiente' | 'enviado' | 'entregado' | 'leido' | 'error';

export interface Mensaje {
  id: number;
  conversacion: number;
  direccion: DireccionMensaje;
  tipo: TipoMensaje;
  contenido: string | null;
  whatsapp_message_id: string | null;
  estado: EstadoMensaje;
  error_mensaje: string | null;
  media_url: string | null;
  media_caption: string | null;
  enviado_por: number | null;
  enviado_por__nombre: string | null;
  fecha: string;
}

export interface EnvioTexto {
  tipo: 'texto';
  contenido: string;
}

export interface EnvioImagen {
  tipo: 'imagen';
  media_url: string;
  caption?: string;
}

export interface EnvioPlantilla {
  tipo: 'template';
  plantilla_nombre: string;
  plantilla_idioma?: string;
  plantilla_variables?: string[];
}

export type PayloadEnvio = EnvioTexto | EnvioImagen | EnvioPlantilla;

export interface RespuestaEnvio {
  ok: boolean;
  mensaje_id?: number;
  whatsapp_message_id?: string;
  mensaje?: string;
}
