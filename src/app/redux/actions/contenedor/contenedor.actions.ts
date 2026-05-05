import { createAction, props } from '@ngrx/store';
import { Contenedor } from '../../../modules/contenedores/interfaces/contenedor.interface';

export const ContenedorActionInit = createAction(
  '[Contenedor] informacion',
  props<{contenedor: Contenedor}>()
);

export const ContenedorGuardarAction = createAction(
  '[Contenedor] Guardar contenedor en localstore',
  props<{contenedor: any}>()
);

export const ContenedorSeleccionAction = createAction(
  '[Contenedor] Seleccionar contenedor',
  props<{ seleccion: boolean }>()
);

export const ContenedorActionBorrarInformacion = createAction(
  '[Contenedor] borrar informacion'
);

export const ContenedorActionActualizarPermisos = createAction(
  '[Contenedor] actualizar permisos',
  props<{
    rol?: string;
    tiene_acceso_web?: boolean;
    tiene_acceso_movil?: boolean;
    perfil_movil?: 'conductor' | 'coordinador' | null;
    permisos: Record<string, { ver: boolean; editar: boolean }> | null;
  }>(),
);
