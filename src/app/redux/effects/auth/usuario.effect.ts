import { Injectable, inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { getCookie, setCookie } from 'typescript-cookie';
import {
  usuarioActionActualizarVrSaldo,
  usuarioIniciar,
} from '../../actions/auth/usuario.actions';
import { Usuario } from '../../../interfaces/user/user.interface';

@Injectable()
export class UsuarioEffects {
  private actions$ = inject(Actions);

  guardarUsuario$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(usuarioIniciar),
        tap((action: { usuario: Usuario }) => {
          let calcularTiempo = new Date(
            new Date().getTime() + 3 * 60 * 60 * 1000
          );
          setCookie('usuario', JSON.stringify(action.usuario), {
            expires: calcularTiempo,
            path: '/',
          });
        })
      ),
    { dispatch: false }
  );

  updateCookieVrSaldo$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(usuarioActionActualizarVrSaldo),
        tap((action) => {
          let coockieUsuario = getCookie('usuario');
          if (coockieUsuario) {
            let jsonUsuario = JSON.parse(coockieUsuario);
            jsonUsuario.vr_saldo = action.vr_saldo;
            setCookie('usuario', JSON.stringify(jsonUsuario), { path: '/' });
          }
        })
      ),
    { dispatch: false }
  );
}
