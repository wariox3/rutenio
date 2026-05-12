import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { take, tap, withLatestFrom } from 'rxjs/operators';
import { getCookie, removeCookie, setCookie } from 'typescript-cookie';
import { Contenedor } from '../../../modules/contenedores/interfaces/contenedor.interface';
import {
  ContenedorActionActualizarPermisos,
  ContenedorActionBorrarInformacion,
  ContenedorActionInit,
} from '../../actions/contenedor/contenedor.actions';
import { environment } from '../../../../environments/environment';

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
          // No persistir permisos en cookie. Siempre se refrescan desde server
          // via mi-membresia para evitar mostrar items con datos stale.
          const { permisos: _permisos, ...contenedorSinPermisos } =
            action.contenedor as any;
          setCookie('contenedor', JSON.stringify(contenedorSinPermisos), {
            expires: calcularTresHoras,
            path: '/',
          });
        })
      ),
    { dispatch: false }
  );

  actualizarPermisosCookie$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ContenedorActionActualizarPermisos),
        tap((payload) => {
          const cookieRaw = getCookie('contenedor');
          if (!cookieRaw) return;
          try {
            const actual = JSON.parse(cookieRaw);
            // permisos NO se persisten en cookie (se refrescan desde server).
            const actualizado = {
              ...actual,
              ...(payload.rol !== undefined ? { rol: payload.rol } : {}),
              ...(payload.tiene_acceso_web !== undefined ? { tiene_acceso_web: payload.tiene_acceso_web } : {}),
              ...(payload.tiene_acceso_movil !== undefined ? { tiene_acceso_movil: payload.tiene_acceso_movil } : {}),
              ...(payload.perfil_movil !== undefined ? { perfil_movil: payload.perfil_movil } : {}),
            };
            const tiempo = new Date(
              new Date().getTime() + environment.sessionLifeTime * 60 * 60 * 1000,
            );
            setCookie('contenedor', JSON.stringify(actualizado), {
              expires: tiempo,
              path: '/',
            });
          } catch {
            // cookie corrupta, ignorar
          }
        }),
      ),
    { dispatch: false },
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
