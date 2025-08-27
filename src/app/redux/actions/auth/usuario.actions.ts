import { createAction, props } from '@ngrx/store';
import { Usuario } from '../../../interfaces/user/user.interface';

export const usuarioIniciar = createAction(
  '[Usuario] informacion',
  props<{ usuario: Usuario }>()
);

export const usuarioActionActualizar = createAction(
  '[Usuario] actualizar',
  props<{ usuario: Partial<Usuario> }>()
);

export const usuarioActionActualizarVrSaldo = createAction(
  '[Usuario] actualizar vr saldo',
  props<{ vr_saldo: number }>()
);

export const usuarioActionActualizarInformacionUsuario = createAction(
  '[Usuario] actualizar informacion usuario',
  props<{
    nombre_corto: string;
    nombre: string;
    apellido: string;
    telefono: string;
    idioma: string;
    cargo: string;
    numero_identificacion: string;
  }>()
);

export const usuarioActionActualizarIdioma = createAction(
  '[Usuario] actualizar idioma',
  props<{ idioma: string }>()
);

export const usuarioActionActualizarVrCredito = createAction(
  '[Usuario] actualizar vr credito',
  props<{ vr_credito: number }>()
);
