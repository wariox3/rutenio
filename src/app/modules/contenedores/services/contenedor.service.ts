import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  ContenedorDetalle,
  ContenedorLista,
  ListaContenedoresRespuesta,
} from '../interfaces/contenedor.interface';
import { ContenedorInvitacionLista, RespuestaConsultaContenedor } from '../interfaces/usuarios-contenedores.interface';
import {
  InvitarUsuario,
  RespuestaInvitacionUsuario,
} from '../interfaces/invitar-contenedor.interface';
import { Movimientos } from '../../facturacion/interfaces/Facturacion';
import { TipoIdentificacionLista } from '../../../interfaces/identificacion/identificacion.interface';
import { CookieService } from '../../../core/servicios/cookie.service';
import { FilterTransformerService } from '../../../core/servicios/filter-transformer.service';
import { map } from 'rxjs';
import { RespuestaApi } from '../../../core/types/api.type';

@Injectable({
  providedIn: 'root',
})
export class ContenedorService {
  private _cookieService = inject(CookieService);
  private _filterTransformService = inject(FilterTransformerService);
  public totalItems = 0;

  constructor(private http: HttpClient) {}

  lista(parametros: Record<string, any>) {
    const params = this._filterTransformService.toQueryString({
      ...parametros,
      serializador: 'lista',
      contenedor__ruteo: 'True',
    });

    return this.http
      .get<RespuestaApi<ContenedorLista>>(
        `${environment.url_api}/contenedor/usuariocontenedor/?${params}`
      )
      .pipe(
        map((res) => {
          // Store the total count for pagination
          this.totalItems = res.count;
          return {
            ...res,
            results: this._agregarPropiedades(res.results),
          };
        })
      );
  }

  listaTipoIdentificacion() {
    return this.http.post<TipoIdentificacionLista>(
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
    return this.http.post<any>(
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
    return this.http.get<RespuestaApi<ContenedorInvitacionLista>>(
      `${environment.url_api}/contenedor/usuariocontenedor/?contenedor_id=${contenedorId}`
    );
  }

  invitarUsuario(payload: InvitarUsuario) {
    return this.http.post<RespuestaInvitacionUsuario>(
      `${environment.url_api}/contenedor/usuariocontenedor/invitar/`,
      {
        accion: payload.accion,
        aplicacion: payload.aplicacion,
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

  detalle(codigoContenedor: number) {
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

  consultaUsuario(usuario_id: string) {
    return this.http.post<Movimientos>(
      `${environment.url_api}/contenedor/movimiento/consulta-usuario/`,
      {
        usuario_id,
      }
    );
  }

  private _isContenedorRestringido(
    valorSaldo: number,
    fechaLimitePago: string
  ) {
    // Si no hay fecha límite, no hay restricción
    if (!fechaLimitePago) {
      return false;
    }

    const fechaHoy = new Date();
    const fechaLimite = new Date(fechaLimitePago);

    // Normalizar las fechas para comparar solo año, mes y día
    const hoy = new Date(
      fechaHoy.getFullYear(),
      fechaHoy.getMonth(),
      fechaHoy.getDate()
    );
    const limite = new Date(
      fechaLimite.getFullYear(),
      fechaLimite.getMonth(),
      fechaLimite.getDate()
    );

    // Si el saldo es mayor a 0 y la fecha límite ya pasó
    if (valorSaldo > 0 && hoy > limite) {
      return true; // Contenedor restringido
    }

    return false; // Contenedor no restringido
  }

  private _agregarPropiedades(contenedores: ContenedorLista[]) {
    // Obtener el usuario de la cookie para verificar saldo y fecha límite
    const usuarioCookie = this._cookieService?.get('usuario');
    let valorSaldo = 0;
    let fechaLimitePago = '';

    if (usuarioCookie) {
      try {
        const usuario = JSON.parse(usuarioCookie);
        valorSaldo = usuario.vr_saldo || 0;
        fechaLimitePago = usuario.fecha_limite_pago || '';
      } catch (error) {
        console.error('Error al parsear la cookie de usuario:', error);
      }
    }

    return contenedores.map((contenedor) => {
      return {
        ...contenedor,
        acceso_restringido: this._isContenedorRestringido(
          valorSaldo,
          fechaLimitePago
        ),
      };
    });
  }
}
