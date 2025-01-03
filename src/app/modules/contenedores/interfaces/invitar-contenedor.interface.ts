export interface InvitarUsuario {
  contenedor_id: number;
  usuario_id: string;
  invitado: string;
  accion: 'invitar';
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
