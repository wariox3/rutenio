import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Configuracion } from '../../modules/configuracion/types/configuracion.types';

const ConfiguracionState = createFeatureSelector<Configuracion>('configuracion');

export const obtenerConfiguracionInformacion = createSelector(
  ConfiguracionState,
  (configuracion) => configuracion
);

export const obtenerConfiguracionDireccionOrigen = createSelector(
  ConfiguracionState,
  (configuracion) => configuracion.rut_direccion_origen
);

export const obtenerConfiguracionDireccionOrigenVacia = createSelector(
  ConfiguracionState,
  (configuracion) => !configuracion.rut_direccion_origen || configuracion.rut_direccion_origen.trim() === ''
);

export const obtenerConfiguracionCoordenadas = createSelector(
  ConfiguracionState,
  (configuracion) => ({
    latitud: configuracion.rut_latitud,
    longitud: configuracion.rut_longitud,
  })
);

export const obtenerConfiguracionRuteo = createSelector(
  ConfiguracionState,
  (configuracion) => ({
    sincronizar_complemento: configuracion.rut_sincronizar_complemento,
    rutear_franja: configuracion.rut_rutear_franja,
  })
);

export const obtenerConfiguracionId = createSelector(
  ConfiguracionState,
  (configuracion) => configuracion.id
);

export const obtenerConfiguracionEmpresaId = createSelector(
  ConfiguracionState,
  (configuracion) => configuracion.empresa
);
