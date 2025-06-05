import { Usuario } from '../../../interfaces/user/user.interface';

export interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

export interface enviarDatosUsuario {
  id: number;
  nombreCorto: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idioma: string;
  imagen: string | null;
  cargo: string;
  numero_identificacion: string;
}

export interface UsuarioInformacionPerfil extends Partial<Usuario> {
  indicativoPais: string;
}
