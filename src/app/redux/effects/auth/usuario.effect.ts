import { Injectable, inject } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { tap } from "rxjs/operators";
import { setCookie } from "typescript-cookie";
import { usuarioIniciar } from "../../actions/auth/usuario.actions";
import { Usuario } from "../../../interfaces/user/user.interface";

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
          setCookie("usuario", JSON.stringify(action.usuario), {
            expires: calcularTiempo,
            path: "/",
          });
        })
      ),
    { dispatch: false }
  );
}
