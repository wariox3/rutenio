import { createAction, props } from '@ngrx/store';
import { Empresa } from '../contenedor/empresa.interface';

export const empresaActionInit = createAction(
  '[Empresa] informacion',
  props<{ empresa: Empresa }>()
);

export const empresaActualizacionAction = createAction(
  '[Empresa] actualizar informacion',
  props<{ empresa: Empresa }>()
);

export const empresaActualizacionImangenAction = createAction(
  '[Empresa] actualizar imagen',
  props<{ imagen: string }>()
);

export const empresaLimpiarAction = createAction(
  '[Empresa] limpiar informacion'
);

export const empresaActualizacionRededocIdAction = createAction(
  '[Empresa] actualizar rededoc_id',
  props<{ rededoc_id: string }>()
);

export const empresaActualizacionAsisteneElectronico = createAction(
  '[Empresa] actualizar asistente electronico',
  props<{ asistente_electronico: boolean }>()
);

export const empresaActualizacionAsistenePredeterminado = createAction(
  '[Empresa] actualizar asistente predeterminado',
  props<{ asistente_predeterminado: boolean }>()
);
