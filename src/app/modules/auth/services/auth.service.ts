import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { removeCookie } from "typescript-cookie";
import { environment } from "../../../../environments/environment.development";
import { noRequiereToken } from "../../../common/interceptors/token.interceptor";
import { TokenService } from "./token.service";
import { enviarDatosUsuario, UsuarioInformacionPerfil } from "../types/informacion-perfil.type";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  registro(parametros: any) {
    return this.http.post<any>(
      `${environment.url_api}/seguridad/usuario/`,
      parametros,
      { context: noRequiereToken() } 
    );
  }

  login(parametros: any) {
    return this.http.post<any>(
      `${environment.url_api}/seguridad/login/`,
      parametros,
      { context: noRequiereToken() }
    );
  }

  logout() {
    localStorage.clear();
    this.tokenService.eliminar();
    removeCookie("usuario", { path: "/" });
    removeCookie("contenedor", { path: "/" });
    window.location.href = "/auth/login ";
  }

  recuperarClave(email: string) {
    return this.http.post(
      `${environment.url_api}/seguridad/usuario/cambio-clave-solicitar/`,
      { username: email, accion: "clave" },
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
      },
    );
  }

  perfil(codigoUsuario: number) {
    return this.http.get<UsuarioInformacionPerfil>(
      `${environment.url_api}/seguridad/usuario/${codigoUsuario}/`,
    );
  }
}
