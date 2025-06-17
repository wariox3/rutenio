import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Empresa } from '../actions/contenedor/empresa.interface';

const Empresa = createFeatureSelector<Empresa>('empresa');

export const obtenerEmpresaInformacion = createSelector(
  Empresa,
  (Empresa) => Empresa
);

export const obtenerEmpresaImagen = createSelector(
  Empresa,
  (Empresa) => `${Empresa.imagen}`
);

export const obtenerEmpresaNombre = createSelector(
  Empresa,
  (Empresa) => `${Empresa.nombre_corto}`
);

export const obtenerEmpresaId = createSelector(
  Empresa,
  (Empresa) => `${Empresa.id}`
);

export const obtenerEmpresaNumeroIdenticionDigitoVerificacion = createSelector(
  Empresa,
  (Empresa) => `${Empresa.numero_identificacion}-${Empresa.digito_verificacion}`
);

export const obtenerEmpresaTelefono = createSelector(
  Empresa,
  (Empresa) => `${Empresa.telefono}`
);

export const obtenerEmpresaDireccion = createSelector(
  Empresa,
  (Empresa) => `${Empresa.direccion}`
);

export const obtenerEmpresRededoc_id = createSelector(
  Empresa,
  (Empresa) => `${Empresa.rededoc_id}`
);

export const obtenerEmpresaAsistenteElectronico = createSelector(
  Empresa,
  (Empresa) => `${Empresa.asistente_electronico}`
);
