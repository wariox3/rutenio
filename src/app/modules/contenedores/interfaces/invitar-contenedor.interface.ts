export interface InvitarUsuario {
  contenedorId: number;
  usuarioId: string;
  usuarioInvitadoId: string;
}

export interface RespuestaInvitacionUsuario {
  verificacion: InvitacionUsuarioVerifiacion;
}

export interface InvitacionUsuarioVerifiacion {
  id: number;
  token: string;
  estado_usado: boolean;
  vence: string;
  accion: string;
  usuario_id: number;
  contenedor_id: number;
  usuario_invitado_username: string;
}
