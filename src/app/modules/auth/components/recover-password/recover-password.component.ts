import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { BehaviorSubject, finalize } from 'rxjs';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputEmailComponent,
  ],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RecoverPasswordComponent {
  private authService = inject(AuthService);
  private _router = inject(Router);
  public estaCargando$ = new BehaviorSubject<boolean>(false);
  // private alerta = inject(AlertaService)

  formulario = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  recuperar() {
    this.estaCargando$.next(true);
    const emailValue = this.formulario.get('email').value;
    this.authService
      .recuperarClave(emailValue)
      .pipe(finalize(() => this.estaCargando$.next(false)))
      .subscribe((resultado: any) => {
        if (resultado.verificacion) {
          // this.alerta.mensajaExitoso('Hemos enviado un enlace al correo electrónico para restablecer tu contraseña .', 'Solicitud exitosa.')
          this._router.navigate(['auth/login']);
        }
      });
  }
}
