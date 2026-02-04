import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Configuracion } from '../../../modules/configuracion/types/configuracion.types';
import { cookieKey } from '../../../core/domain/enums/cookie-key.enum';
import {
  configuracionActionInit,
  configuracionActualizacionAction,
  configuracionActualizacionDireccionOrigenAction,
  configuracionLimpiarAction,
} from '../../actions/configuracion/configuracion.actions';
import { CookieService } from '../../../core/servicios/cookie.service';

@Injectable()
export class ConfiguracionEffects {
  private readonly _cookieService = inject(CookieService);

  constructor(private actions$: Actions) {}

  guardarConfiguracion$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(configuracionActionInit),
        tap(({ configuracion }) => {
          const tiempo = this._cookieService.calcularTiempoCookie(24);
          this._cookieService.set(cookieKey.CONFIGURACION, JSON.stringify(configuracion), {
            expires: tiempo,
            path: '/',
          });
        })
      ),
    { dispatch: false }
  );

  actualizarConfiguracionCookie$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(configuracionActualizacionAction),
        tap(({ configuracion }) => {
          this._cookieService.set(cookieKey.CONFIGURACION, JSON.stringify(configuracion), {
            path: '/',
          });
        })
      ),
    { dispatch: false }
  );

  actualizarDireccionOrigenCookie$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(configuracionActualizacionDireccionOrigenAction),
        tap(({ rut_direccion_origen, rut_latitud, rut_longitud }) => {
          let configuracionJson = this._cookieService.get(cookieKey.CONFIGURACION);

          if (configuracionJson) {
            const configuracionParsed = JSON.parse(configuracionJson);
            const newConfiguracion: Configuracion = {
              ...configuracionParsed,
              rut_direccion_origen,
              rut_latitud,
              rut_longitud,
            };

            this._cookieService.set(
              cookieKey.CONFIGURACION,
              JSON.stringify(newConfiguracion),
              {
                path: '/',
              }
            );
          }
        })
      ),
    { dispatch: false }
  );

  eliminarConfiguracion$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(configuracionLimpiarAction),
        tap(() => {
          const cookieKeysLimpiar = [cookieKey.CONFIGURACION];
          cookieKeysLimpiar.map((cookieKey) => {
            this._cookieService.delete(cookieKey, '/');
          });
        })
      ),
    {
      dispatch: false,
    }
  );
}
