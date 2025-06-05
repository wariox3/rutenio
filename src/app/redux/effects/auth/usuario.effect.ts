import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { getCookie, setCookie } from 'typescript-cookie';
import { environment } from '../../../../environments/environment.development';
import { Usuario } from '../../../interfaces/user/user.interface';
import {
  usuarioActionActualizar,
  usuarioActionActualizarVrSaldo,
  usuarioIniciar,
} from '../../actions/auth/usuario.actions';

@Injectable()
export class UsuarioEffects {
  private actions$ = inject(Actions);

  guardarUsuario$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(usuarioIniciar),
        tap((action: { usuario: Usuario }) => {
          let calcularTiempo = new Date(
            new Date().getTime() + environment.sessionLifeTime * 60 * 60 * 1000
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

  updateCookie$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(usuarioActionActualizar),
        tap(({ usuario }) => {
          let usuarioCookie = getCookie('usuario');
          if (usuarioCookie) {
            let usuarioParsed = JSON.parse(usuarioCookie);
            usuario = { ...usuarioParsed, ...usuario };
            setCookie('usuario', JSON.stringify(usuario), { path: '/' });
          }
        })
      ),
    { dispatch: false }
  );
}
