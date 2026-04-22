export type EstadoConexion = 'pendiente' | 'activo' | 'error';

export interface WhatsappConexion {
  id: number;
  phone_number_id: string;
  waba_id: string;
  display_phone_number: string | null;
  verified_name: string | null;
  estado: EstadoConexion;
  error_mensaje: string | null;
  verify_token: string;
  fecha_conexion: string;
  fecha_actualizacion: string;
}

export interface WhatsappConexionUpsert {
  phone_number_id: string;
  waba_id: string;
  access_token: string;
  app_secret?: string;
  verify_token?: string;
}

export interface WhatsappProbarRespuesta {
  ok: boolean;
  mensaje?: string;
  data?: Record<string, any>;
}
