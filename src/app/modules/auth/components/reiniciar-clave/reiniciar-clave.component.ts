import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ConfirmarPasswordValidator } from '../../../../common/validaciones/confirmar-password.validator';

@Component({
  selector: 'app-reiniciar-clave',
  standalone: true,
  imports: [
    InputPasswordComponent,
    ButtonComponent,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './reiniciar-clave.component.html',
  styleUrl: './reiniciar-clave.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReiniciarClaveComponent extends General {
  inhabilitarBtnRestablecer: boolean = true;
  private authService = inject(AuthService);
  private _router = inject(Router);
  public estaCargando$ = new BehaviorSubject<boolean>(false);

  formulario = new FormGroup(
    {
      clave: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ])
      ),
      confirmarClave: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ])
      ),
    },
    { validators: ConfirmarPasswordValidator.validarClave }
  );

  restablecer() {
    if (this.formulario.valid) {
      this.estaCargando$.next(true);
      const claveValue = this.formulario.get('clave').value;
      const token = this.activatedRoute.snapshot.paramMap.get('token')!;
      this.authService
        .reiniciarClave(claveValue, token)
        .pipe(finalize(() => this.estaCargando$.next(false)))
        .subscribe((resultado: any) => {
          if (resultado.cambio) {
            this.alerta.mensajaExitoso(
              'Se ha cambiado con exito la contraseña.',
              'Solicitud exitosa.'
            );
            this._router.navigate(['auth/login']);
          }
        });
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}
