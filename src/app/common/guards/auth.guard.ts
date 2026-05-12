import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { TokenService } from '../../modules/auth/services/token.service';
import { obtenerUsuario } from '../../redux/selectors/usuario.selector';

export const authGuard: CanMatchFn = (route, segments) => {
  const tokenValido = inject(TokenService).validarToken();
  const router = inject(Router);

  if (!tokenValido) {
    router.navigate(['/auth']);
    return false;
  }

  // Si el usuario tiene cambio de clave pendiente, redirigir antes de permitir el acceso.
  let cambioPendiente = false;
  inject(Store)
    .select(obtenerUsuario)
    .pipe(take(1))
    .subscribe((u) => {
      cambioPendiente = !!u?.debe_cambiar_clave;
    });
  if (cambioPendiente) {
    router.navigate(['/auth/cambio-clave-obligatorio']);
    return false;
  }
  return true;
};
