import { createFeatureSelector, createSelector } from '@ngrx/store';

const Contenedor = createFeatureSelector<any>('contenedor');

export const obtenerContenedorSeleccion = createSelector(
  Contenedor,
  (Contenedor) => Contenedor.seleccion
);

export const obtenerContenedorNombre = createSelector(
  Contenedor,
  (Contenedor) => `${Contenedor.nombre}`
);

export const obtenerLogoContenedor = createSelector(
  Contenedor,
  (Contenedor) => `${Contenedor.imagen}`
);

export const obtenerContenedorId = createSelector(
  Contenedor,
  (Contenedor) => `${Contenedor.id}`
);


export const obtenerContenedorSubdominio = createSelector(
  Contenedor,
  (Contenedor) => `${Contenedor.subdominio}`
);

export const obtenerContenedorRol = createSelector(
  Contenedor,
  (Contenedor) => Contenedor?.rol || ''
);

export const obtenerEsAdminContenedor = createSelector(
  Contenedor,
  (Contenedor) => (Contenedor?.rol || '') === 'propietario'
);

export const obtenerPerfilWeb = createSelector(
  Contenedor,
  (Contenedor) => Contenedor?.perfil_web || null
);

export const obtenerPuedeEscribir = createSelector(
  Contenedor,
  (Contenedor) => {
    const rol = Contenedor?.rol || '';
    if (rol === 'propietario') return true;
    const perfil = Contenedor?.perfil_web || 'operativo';
    return perfil === 'operativo' || perfil === 'supervisor';
  }
);

export const obtenerPerfilMovil = createSelector(
  Contenedor,
  (Contenedor) => Contenedor?.perfil_movil || null
);

export const obtenerPermisos = createSelector(
  Contenedor,
  (Contenedor) => Contenedor?.permisos || null
);

/**
 * Devuelve true si el usuario activo puede `ver` o `editar` el modulo dado.
 * Admin/propietario tiene acceso total. Si no hay permisos cargados, asume false
 * salvo cuando el usuario es propietario.
 */
export const obtenerPermisoPor = (modulo: string, accion: 'ver' | 'editar') =>
  createSelector(Contenedor, (c) => {
    if ((c?.rol || '') === 'propietario') return true;
    const permisos = c?.permisos;
    if (!permisos) return false;
    const m = permisos[modulo];
    return !!(m && m[accion]);
  });
