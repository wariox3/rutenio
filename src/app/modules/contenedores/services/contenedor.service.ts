import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  ContenedorDetalle,
  ContenedorLista,
  ListaContenedoresRespuesta,
} from '../interfaces/contenedor.interface';
import {
  ContenedorInvitacionLista,
  RespuestaConsultaContenedor,
} from '../interfaces/usuarios-contenedores.interface';
import {
  InvitarUsuario,
  RespuestaInvitacionUsuario,
} from '../interfaces/invitar-contenedor.interface';
import { Movimientos } from '../../facturacion/interfaces/Facturacion';
import { TipoIdentificacionLista } from '../../../interfaces/identificacion/identificacion.interface';
import { CookieService } from '../../../core/servicios/cookie.service';
import { FilterTransformerService } from '../../../core/servicios/filter-transformer.service';
import { map } from 'rxjs';
import { Autocompletar, RespuestaApi } from '../../../core/types/api.type';
import { CiudadAutocompletar } from '../../../common/interfaces/general.interface';

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
    return this.http.get<RespuestaApi<Autocompletar>>(
      `${environment.url_api}/contenedor/identificacion/?limit=10`
    );
  }

  listaPlanes() {
    return this.http.get<any[]>(`${environment.url_api}/contenedor/plan/`);
  }

  listaCiudades(parametros: Record<string, any>) {
    const params = this._filterTransformService.toQueryString({
      ...parametros,
      limit: 10,
    });

    return this.http.get<CiudadAutocompletar[]>(
      `${environment.url_api}/contenedor/ciudad/seleccionar/?${params}`
    );
  }

  actualizarMembresia(membresiaId: number, datos: any) {
    return this.http.patch<any>(
      `${environment.url_api}/contenedor/usuariocontenedor/${membresiaId}/admin-actualizar/`,
      datos,
    );
  }

  aplicarPlantilla(membresiaId: number, plantilla: 'consulta' | 'operativo' | 'supervisor') {
    return this.http.post<any>(
      `${environment.url_api}/contenedor/usuariocontenedor/${membresiaId}/aplicar-plantilla/`,
      { plantilla },
    );
  }

  miMembresia(contenedorId: number) {
    return this.http.get<{
      rol: string;
      tiene_acceso_web: boolean;
      tiene_acceso_movil: boolean;
      perfil_movil: 'conductor' | 'coordinador' | null;
      permisos: Record<string, { ver: boolean; editar: boolean }> | null;
    }>(`${environment.url_api}/contenedor/usuariocontenedor/mi-membresia/?contenedor_id=${contenedorId}`);
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

  cederAdmin(contenedorId: number, nuevoAdminId: number) {
    return this.http.post<{ mensaje: string }>(
      `${environment.url_api}/contenedor/usuariocontenedor/ceder-admin/`,
      {
        contenedor_id: contenedorId,
        nuevo_admin_id: nuevoAdminId,
      }
    );
  }

  invitarUsuario(payload: InvitarUsuario) {
    const body: any = {
      contenedor_id: payload.contenedorId,
      usuario_id: payload.usuarioId,
      usuario_invitado_id: payload.usuarioInvitadoId,
    };
    if (payload.contenedoresIds && payload.contenedoresIds.length > 0) {
      body.contenedores_ids = payload.contenedoresIds;
    }
    if (payload.tieneAccesoWeb !== undefined) {
      body.tiene_acceso_web = payload.tieneAccesoWeb;
    }
    if (payload.tieneAccesoMovil !== undefined) {
      body.tiene_acceso_movil = payload.tieneAccesoMovil;
    }
    if (payload.perfilWeb) {
      body.perfil_web = payload.perfilWeb;
    }
    if (payload.perfilMovil) {
      body.perfil_movil = payload.perfilMovil;
    }
    return this.http.post<RespuestaInvitacionUsuario>(
      `${environment.url_api}/contenedor/usuariocontenedor/nuevo/`,
      body
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

  buscarUsuario(queries: Record<string, any>) {
    const params = this._filterTransformService.toQueryString({
      ...queries,
    });
    
    return this.http.get(`${environment.url_api}/contenedor/usuario/seleccionar/?${params}`);
  }

  eliminarEmpresaUsuario(usuario_id: Number) {
    return this.http.delete(
      `${environment.url_api}/contenedor/usuariocontenedor/${usuario_id}/`,
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
