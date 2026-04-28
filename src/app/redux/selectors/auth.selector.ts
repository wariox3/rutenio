import { createFeatureSelector, createSelector } from '@ngrx/store';

const Usuario = createFeatureSelector<any>('usuario');

export const obtenerEsSuperAdmin = createSelector(
  Usuario,
  (usuario) => !!(usuario?.is_superuser)
);
