export interface InvitarUsuario {
  contenedorId: number;
  usuarioId: string;
  usuarioInvitadoId: string;
  contenedoresIds?: number[];
  tieneAccesoWeb?: boolean;
  tieneAccesoMovil?: boolean;
  perfilWeb?: 'operativo' | 'supervisor' | 'consulta';
  perfilMovil?: 'conductor' | 'coordinador' | null;
}

export interface RespuestaInvitacionUsuario {
  creados: number[];
  ya_existian: number[];
  mensaje: string;
}
