import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  ContenedorDetalle,
  ListaContenedoresRespuesta,
} from '../../../interfaces/contenedor/contenedor.interface';
import { RespuestaConsultaContenedor } from '../interfaces/usuarios-contenedores.interface';
import {
  InvitarUsuario,
  RespuestaInvitacionUsuario,
} from '../interfaces/invitar-contenedor.interface';
import { Movimientos } from '../../facturacion/interfaces/Facturacion';

@Injectable({
  providedIn: 'root',
})
export class ContenedorService {
  constructor(private http: HttpClient) {}

  lista(usuario_id: string) {
    return this.http.post<ListaContenedoresRespuesta>(
      `${environment.url_api}/contenedor/usuariocontenedor/consulta-usuario/`,
      {
        usuario_id,
        ruteo: true,
      }
    );
  }

  listaTipoIdentificacion() {
    return this.http.post<any[]>(
      `${environment.url_api}/contenedor/funcionalidad/lista-autocompletar/`,
      {
        filtros: [],
        limite: 10,
        desplazar: 0,
        ordenamientos: [],
        limite_conteo: 10000,
        modelo: 'CtnIdentificacion',
      }
    );
  }

  listaPlanes() {
    return this.http.get<any[]>(`${environment.url_api}/contenedor/plan/`);
  }

  listaCiudades(arrFiltros: any) {
    return this.http.post<any[]>(
      `${environment.url_api}/contenedor/funcionalidad/lista-autocompletar/`,
      arrFiltros
    );
  }

  consultarNombre(subdominio: string) {
    return this.http.post<{ validar: boolean }>(
      `${environment.url_api}/contenedor/contenedor/validar/`,
      {
        subdominio,
      }
    );
  }

  nuevo(data: any, usuario_id: string) {
    return this.http.post(`${environment.url_api}/contenedor/contenedor/`, {
      ...data,
      usuario_id,
    });
  }

  listaUsuarios(contenedorId: number) {
    return this.http.post<RespuestaConsultaContenedor>(
      `${environment.url_api}/contenedor/usuariocontenedor/consulta-contenedor/`,
      {
        contenedor_id: contenedorId,
      }
    );
  }

  invitarUsuario(payload: InvitarUsuario) {
    return this.http.post<RespuestaInvitacionUsuario>(
      `${environment.url_api}/contenedor/usuariocontenedor/invitar/`,
      {
        accion: payload.accion,
        contenedor_id: payload.contenedor_id,
        usuario_id: payload.usuario_id,
        invitado: payload.invitado,
      }
    );
  }

  eliminarContenedor(contenedorId: number) {
    return this.http.delete(
      `${environment.url_api}/contenedor/contenedor/${contenedorId}/`
    );
  }

  detalle(codigoContenedor: string) {
    return this.http.get<ContenedorDetalle>(
      `${environment.url_api}/contenedor/contenedor/${codigoContenedor}/`
    );
  }

  contenedorGenerarIntegridad(data: any) {
    return this.http.post<{ hash: string }>(
      `${environment.url_api}/contenedor/movimiento/generar-integridad/`,
      {
        ...data,
      }
    );
  }

  consultaUsuario(usuario_id: number) {
    return this.http.post<Movimientos>(
      `${environment.url_api}/contenedor/movimiento/consulta-usuario/`,
      {
        usuario_id,
      }
    );
  }
}
