import { createFeatureSelector, createSelector } from '@ngrx/store';

const Usuario = createFeatureSelector<any>('usuario');

export const obtenerUsuarioNombreCorto = createSelector(
  Usuario,
  (Usuario) => `${Usuario.nombre_corto}`
);

export const obtenerUsuarioId = createSelector(
  Usuario,
  (Usuario) => Usuario.id
);

export const obtenerUsuarioSuspencion = createSelector(
  Usuario,
  (Usuario) => Usuario.vr_saldo > 0
);

export const obtenerUsuarioFechaLimitePago = createSelector(
  Usuario,
  (Usuario) => Usuario.fecha_limite_pago
);

export const obtenerUsuarioVrSaldo = createSelector(
  Usuario,
  (Usuario) => Usuario.vr_saldo
);

export const obtenerValidacionSaldo = (saldo: number) =>
  createSelector(Usuario, (Usuario) => Usuario.vr_saldo !== saldo);
