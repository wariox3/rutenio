import { createAction, props } from '@ngrx/store';
import { Configuracion } from '../../../modules/configuracion/types/configuracion.types';

export const configuracionActionInit = createAction(
  '[Configuracion] informacion',
  props<{ configuracion: Configuracion }>()
);

export const configuracionActualizacionAction = createAction(
  '[Configuracion] actualizar informacion',
  props<{ configuracion: Configuracion }>()
);

export const configuracionActualizacionDireccionOrigenAction = createAction(
  '[Configuracion] actualizar direccion origen',
  props<{ rut_direccion_origen: string; rut_latitud: string; rut_longitud: string }>()
);

export const configuracionLimpiarAction = createAction(
  '[Configuracion] limpiar informacion'
);
