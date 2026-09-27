// Eventos del timeline de seguimiento de un viaje (despacho). El backend los
// discrimina por `tipo`. Ver escandio/ruteo/models/seguimiento.py.
export type SeguimientoTipo = 'consulta' | 'respuesta' | 'llamada' | 'nota';
export type SeguimientoEstado = 'pendiente' | 'respondida' | 'expirada';
export type SeguimientoOrigen = 'manual' | 'automatico';

export interface Seguimiento {
  id: number;
  fecha_registro: string;
  comentario: string | null;
  despacho: number;
  usuario_id: number | null;
  autor_nombre: string | null;
  tipo: SeguimientoTipo;
  estado: SeguimientoEstado | null;
  origen: SeguimientoOrigen | null;
  opciones: string[] | null;
  opcion: string | null;
  consulta: number | null;
  es_conductor: boolean;
}
