import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { removeCookie } from "typescript-cookie";
import { environment } from "../../../../../environments/environment.development";
import { noRequiereToken } from "../../../../common/interceptors/token.interceptor";
import { TokenService } from "./token.service";

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
    window.location.href = "";
  }

  recuperarClave(email: string) {
    return this.http.post(
      `${environment.url_api}/seguridad/usuario/cambio-clave-solicitar/`,
      { username: email, accion: "clave" },
      { context: noRequiereToken() }
    );
  }
}
