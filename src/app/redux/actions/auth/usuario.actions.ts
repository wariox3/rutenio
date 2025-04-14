import { createAction, props } from '@ngrx/store';
import { Usuario } from '../../../interfaces/user/user.interface';

export const usuarioIniciar = createAction(
    '[Usuario] informacion',
    props<{usuario: Usuario}>()
);

export const usuarioActionActualizarVrSaldo = createAction(
    '[Usuario] actualizar vr saldo',
    props<{ vr_saldo: number }>()
  );