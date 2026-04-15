export interface Alerta {
  id: number;
  fecha: string;
  tipo: 'parada_prolongada' | 'fuera_geocerca';
  mensaje: string | null;
  despacho: number | null;
  despacho__id: number | null;
  despacho__vehiculo__placa: string | null;
  visita: number | null;
  visita__numero: number | null;
  visita__destinatario: string | null;
  usuario_id: number | null;
  latitud: string | null;
  longitud: string | null;
  duracion_minutos: number | null;
  leida: boolean;
  fecha_leida: string | null;
}
