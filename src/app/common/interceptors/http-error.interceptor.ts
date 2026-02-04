import {
  HttpErrorResponse,
  type HttpInterceptorFn,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AlertaService } from "../services/alerta.service";
import { AuthService } from "../../modules/auth/services/auth.service";

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const alerta = inject(AlertaService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: any) => {
      let errorCodigo: string;
      let errorMensaje: string = " ";

      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            errorMensaje = "Credenciales invalidas.";
            auth.logout();
            break;
          case 500:
            errorMensaje = "Se produjo un error interno en el servidor.";
            errorCodigo = "500";
            break;
          default:
            let objError = error.error;
            if (objError.hasOwnProperty("error")) {
              errorCodigo = objError.codigo;
              errorMensaje = objError.error;
            }
            if (objError.hasOwnProperty("mensaje")) {
              errorCodigo = objError.codigo;
              errorMensaje = `${objError.mensaje}\n`;
            }
            if (objError.hasOwnProperty("validaciones")) {
              for (const key in objError.validaciones) {
                errorMensaje += `${key}: ${objError.validaciones[key]}`;
              }
            }
            break;
        }

        const errorTitulo = errorCodigo ? `Código de error:  ${errorCodigo}` : "Error";

        alerta.mensajeError(errorTitulo, errorMensaje);
      }

      return throwError(error?.error);
    })
  );
};
