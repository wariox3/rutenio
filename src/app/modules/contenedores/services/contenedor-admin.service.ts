import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getCookie } from 'typescript-cookie';
import { environment } from '../../../../environments/environment';

export type Plantilla = 'consulta' | 'operativo' | 'supervisor';

export interface PermisosModulo {
  ver: boolean;
  editar: boolean;
}

export type PermisosMembresia = Record<string, PermisosModulo>;

export interface CrearUsuarioPayload {
  username: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  password?: string;
  enviar_invitacion?: boolean;
}

export interface ActualizarMembresiaPayload {
  tiene_acceso_web?: boolean;
  tiene_acceso_movil?: boolean;
  perfil_movil?: 'conductor' | 'coordinador' | null;
  permisos?: PermisosMembresia;
}

export const MODULOS_OPERATIVOS = [
  'visita',
  'vehiculo',
  'despacho',
  'franja',
  'flota',
  'novedad',
  'contacto',
] as const;

export const MODULOS_ADMINISTRATIVOS = [
  'empresa',
  'configuracion',
  'mensajeria',
  'facturacion',
  'usuario',
] as const;

export const MODULOS_PERMISOS = [
  ...MODULOS_OPERATIVOS,
  ...MODULOS_ADMINISTRATIVOS,
] as const;

export type ModuloPermiso = (typeof MODULOS_PERMISOS)[number];

export const GRUPOS_MODULOS: Array<{
  titulo: string;
  descripcion: string;
  modulos: readonly string[];
}> = [
  {
    titulo: 'Operativos',
    descripcion: 'Día a día: visitas, vehículos, despachos, etc.',
    modulos: MODULOS_OPERATIVOS,
  },
  {
    titulo: 'Administrativos',
    descripcion: 'Configuración del contenedor, empresa, facturación y usuarios.',
    modulos: MODULOS_ADMINISTRATIVOS,
  },
];

@Injectable({ providedIn: 'root' })
export class ContenedorAdminService {
  private http = inject(HttpClient);

  private get headers(): HttpHeaders {
    const token = getCookie('admin_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  crearUsuario(payload: CrearUsuarioPayload) {
    return this.http.post<{ usuario: any; invitacion_enviada: boolean }>(
      `${environment.url_api}/contenedor/usuario/admin-crear/`,
      payload,
      { headers: this.headers },
    );
  }

  resetPassword(usuarioId: number, password: string) {
    return this.http.post<{ id: number; reset: boolean }>(
      `${environment.url_api}/contenedor/usuario/${usuarioId}/admin-reset-password/`,
      { password },
      { headers: this.headers },
    );
  }

  actualizarUsuario(usuarioId: number, datos: Record<string, any>) {
    return this.http.patch<{ usuario: any }>(
      `${environment.url_api}/contenedor/usuario/${usuarioId}/admin-actualizar/`,
      datos,
      { headers: this.headers },
    );
  }

  actualizarMembresia(membresiaId: number, datos: ActualizarMembresiaPayload) {
    return this.http.patch<any>(
      `${environment.url_api}/contenedor/usuariocontenedor/${membresiaId}/admin-actualizar/`,
      datos,
      { headers: this.headers },
    );
  }

  aplicarPlantilla(membresiaId: number, plantilla: Plantilla) {
    return this.http.post<any>(
      `${environment.url_api}/contenedor/usuariocontenedor/${membresiaId}/aplicar-plantilla/`,
      { plantilla },
      { headers: this.headers },
    );
  }

  obtenerUsuario(usuarioId: number) {
    return this.http.get<any>(
      `${environment.url_api}/contenedor/usuario/${usuarioId}/`,
      { headers: this.headers },
    );
  }

  obtenerMembresiasDeUsuario(usuarioId: number) {
    return this.http.get<any>(
      `${environment.url_api}/contenedor/usuariocontenedor/?usuario_id=${usuarioId}&serializador=lista&page_size=100`,
      { headers: this.headers },
    );
  }

  toggleActivo(usuarioId: number) {
    return this.http.post<{ id: number; is_active: boolean }>(
      `${environment.url_api}/contenedor/usuario/${usuarioId}/admin-toggle-activo/`,
      {},
      { headers: this.headers },
    );
  }
}
