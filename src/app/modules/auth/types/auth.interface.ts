import { Usuario } from '../../../interfaces/user/user.interface';

export interface RespuestaLogin {
  token: string;
  'refresh-token': string;
  user: Usuario;
}

export interface RespuestaRegistro {
  usuario: Usuario;
}
