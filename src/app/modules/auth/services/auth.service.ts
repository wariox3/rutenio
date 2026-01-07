import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { removeCookie } from 'typescript-cookie';
import { environment } from '../../../../environments/environment.development';
import { noRequiereToken } from '../../../common/interceptors/token.interceptor';
import { TokenService } from './token.service';
import {
  ConfirmarInivitacion,
  enviarDatosUsuario,
  TokenReenviarValidacion,
  TokenVerificacion,
  UsuarioInformacionPerfil,
} from '../types/informacion-perfil.type';
import { AuthState } from '../state/auth.state';
import { catchError, of, tap } from 'rxjs';
import { RespuestaLogin } from '../types/auth.interface';
import { Usuario } from '../../../interfaces/user/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private state = inject(AuthState)

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  registro(parametros: any) {
    return this.http.post<any>(
      `${environment.url_api}/seguridad/usuario/nuevo/`,
      { ...parametros, aplicacion: 'ruteo' },
      { context: noRequiereToken() }
    );
  }

   loadUser() {
    return this.http.get('/auth/me', {
      withCredentials: true,
    }).pipe(
      tap((user: Usuario) => this.state.setUser(user)),
      catchError(() => {
        this.state.clear();
        return of(null);
      })
    );
  }

  login(parametros: any) {
    return this.http.post<RespuestaLogin>(
      `${environment.url_api}/seguridad/login/`,
      parametros,
      { context: noRequiereToken() }
    ).pipe(
      tap((response) => {
        this.state.setUser(response.user);
      })
    );
  }

  validacion(token: string) {
    return this.http.post<TokenVerificacion>(
      `${environment.url_api}/seguridad/usuario/verificar/`,
      { token },
      { context: noRequiereToken() }
    );
  }

  reenviarValidacion(codigoUsuario: number) {
    return this.http.post<TokenReenviarValidacion>(
      `${environment.url_api}/seguridad/verificacion/`,
      { codigoUsuario },
      { context: noRequiereToken() }
    );
  }

  logout() {
    localStorage.clear();
    this.tokenService.eliminar();
    removeCookie('usuario', { path: '/' });
    removeCookie('contenedor', { path: '/' });
    window.location.href = '/auth/login ';
  }

  recuperarClave(email: string) {
    return this.http.post(
      `${environment.url_api}/seguridad/usuario/cambio-clave-solicitar/`,
      { username: email, accion: 'clave', aplicacion: 'ruteo' },
      { context: noRequiereToken() }
    );
  }

  reiniciarClave(password: string, token: string) {
    return this.http.post(
      `${environment.url_api}/seguridad/usuario/cambio-clave-verificar/`,
      { password, token },
      { context: noRequiereToken() }
    );
  }

  cargarImagen(usuario_id: Number | string, imagenB64: string) {
    return this.http.post<{
      cargar: boolean;
      imagen: string;
    }>(`${environment.url_api}/seguridad/usuario/cargar-imagen/`, {
      usuario_id,
      imagenB64,
    });
  }

  eliminarImagen(usuario_id: Number | string) {
    return this.http.post<{
      limpiar: boolean;
      imagen: string;
    }>(`${environment.url_api}/seguridad/usuario/limpiar-imagen/`, {
      usuario_id,
    });
  }

  actualizarInformacion(data: enviarDatosUsuario) {
    return this.http.put<UsuarioInformacionPerfil>(
      `${environment.url_api}/seguridad/usuario/${data.id}/`,
      {
        nombre: data.nombre,
        apellido: data.apellido,
        nombre_corto: data.nombreCorto,
        telefono: data.telefono,
        idioma: data.idioma,
        cargo: data.cargo,
        numero_identificacion: data.numero_identificacion,
      }
    );
  }

  confirmarInivitacion(token: string) {
    return this.http.post<ConfirmarInivitacion>(
      `${environment.url_api}/contenedor/usuariocontenedor/confirmar/`,
      {
        token,
      }
    );
  }

  perfil(codigoUsuario: string) {
    return this.http.get<UsuarioInformacionPerfil>(
      `${environment.url_api}/seguridad/usuario/${codigoUsuario}/`
    );
  }
}
