import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { removeCookie, setCookie } from 'typescript-cookie';
import { Contenedor } from '../../../modules/contenedores/interfaces/contenedor.interface';
import {
  ContenedorActionBorrarInformacion,
  ContenedorActionInit,
} from '../../actions/contenedor/contenedor.actions';
import { environment } from '../../../../environments/environment.development';

@Injectable()
export class ContenedorEffects {
  guardarConenedor$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ContenedorActionInit),
        tap((action: { contenedor: Contenedor }) => {
          let calcularTresHoras = new Date(
            new Date().getTime() + environment.sessionLifeTime * 60 * 60 * 1000
          );
          setCookie('contenedor', JSON.stringify(action.contenedor), {
            expires: calcularTresHoras,
            path: '/',
          });
        })
      ),
    { dispatch: false }
  );

  eliminarContenedor$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ContenedorActionBorrarInformacion),
        tap(() => {
          const patrones = ['contenedor'];
          document.cookie.split(';').forEach(function (cookie) {
            const cookieNombre = cookie.split('=')[0].trim();
            patrones.forEach(function (patron) {
              if (cookieNombre.startsWith(patron)) {
                removeCookie(cookieNombre);
              }
            });
          });
        })
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions) {}
}
