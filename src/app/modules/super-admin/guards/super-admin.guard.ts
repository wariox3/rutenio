import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { obtenerEsSuperAdmin } from '../../../redux/selectors/auth.selector';
import { AlertaService } from '../../../common/services/alerta.service';

export const superAdminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const alerta = inject(AlertaService);
  return store.select(obtenerEsSuperAdmin).pipe(
    take(1),
    map((es: boolean) => {
      if (es) return true;
      alerta.mensajeError('Acceso restringido', 'Solo super administradores pueden ingresar.');
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
