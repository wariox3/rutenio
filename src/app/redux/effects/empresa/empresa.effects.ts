import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Empresa } from '../../actions/contenedor/empresa.interface';
import { cookieKey } from '../../../core/domain/enums/cookie-key.enum';
import { environment } from '../../../../environments/environment.development';
import { empresaActionInit, empresaActualizacionAction, empresaActualizacionImangenAction, empresaActualizacionRededocIdAction, empresaLimpiarAction } from '../../actions/empresa/empresa.actions';
import { CookieService } from '../../../core/servicios/cookie.service';

@Injectable()
export class EmpresaEffects {
  private readonly _cookieService = inject(CookieService);

  constructor(private actions$: Actions) {}

  guardarEmpresa$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(empresaActionInit),
        tap(({ empresa }) => {
          const tiempo = this._cookieService.calcularTiempoCookie(
            environment.sessionLifeTime,
          );
          this._cookieService.set(cookieKey.EMPRESA, JSON.stringify(empresa), {
            expires: tiempo,
            path: '/',
          });
        }),
      ),
    { dispatch: false },
  );

  actualizarInformacionCookie$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(empresaActualizacionAction),
        tap(({ empresa }) => {
          this._cookieService.set(cookieKey.EMPRESA, JSON.stringify(empresa), {
            path: '/',
          });
        }),
      ),
    { dispatch: false },
  );

  actualizarImagenCookie$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(empresaActualizacionImangenAction),
        tap(({ imagen }) => {
          let empresaJson = this._cookieService.get(cookieKey.EMPRESA);

          if (empresaJson) {
            const empresaParsed = JSON.parse(empresaJson);
            const newEmpresa: Empresa = {
              ...empresaParsed,
              imagen,
            };

            this._cookieService.set(
              cookieKey.EMPRESA,
              JSON.stringify(newEmpresa),
              {
                path: '/',
              },
            );
          }
        }),
      ),
    { dispatch: false },
  );

  eliminarEmpresa$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(empresaLimpiarAction),
        tap(() => {
          const cookieKeysLimpiar = [cookieKey.EMPRESA];
          cookieKeysLimpiar.map((cookieKey) => {
            this._cookieService.delete(cookieKey, '/');
          });
        }),
      ),
    {
      dispatch: false,
    },
  );
}
