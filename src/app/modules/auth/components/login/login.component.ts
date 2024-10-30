import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, of } from 'rxjs';
import { RespuestaLogin } from '../../../../interfaces/auth/auth.interface';
import { usuarioIniciar } from '../../../../redux/actions/auth/usuario.actions';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPasswordComponent,
    InputEmailComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private store = inject(Store);
  private _router = inject(Router);

  public isLoading: boolean = false;
  public mostrarClave: boolean = false;
  public tipoClaveInput: 'text' | 'password' = 'password';

  formularioLogin = new FormGroup({
    username: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
      ])
    ),
  });

  toggleMostrarClave() {
    this.tipoClaveInput =
      this.tipoClaveInput === 'password' ? 'text' : 'password';
  }

  enviar() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      this.formularioLogin.markAsDirty()
      return;
    }

    this.isLoading = true;
    this.authService
      .login(this.formularioLogin.value)
      .pipe(
        catchError(() => {
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe((resultado: RespuestaLogin) => {
        if (resultado.token) {
          let calcularTiempo = new Date(
            new Date().getTime() + 3 * 60 * 60 * 1000
          );
          this.store.dispatch(
            usuarioIniciar({
              usuario: resultado.user,
            })
          );
          this.tokenService.guardar(resultado.token, calcularTiempo);
          this._router.navigate(['contenedor']);
        }
      });
  }

  get username() {
    return this.formularioLogin.get('username');
  }

  get password() {
    return this.formularioLogin.get('password');
  }
}
