export type EstadoConversacion = 'abierta' | 'cerrada';

export interface Conversacion {
  id: number;
  cliente_telefono: string;
  cliente_nombre: string | null;
  visita_id: number | null;
  estado: EstadoConversacion;
  asignada_a: number | null;
  asignada_a__nombre: string | null;
  ultimo_mensaje_fecha: string | null;
  no_leidos: number;
  fecha_ventana_24h: string | null;
  fecha: string;
  fecha_actualizacion: string;
}

export interface ListaConversaciones {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversacion[];
}
