import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { RespuestaLogin } from '../../../../interfaces/auth/auth.interface';
import { usuarioIniciar } from '../../../../redux/actions/auth/usuario.actions';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

declare global {
  interface Window {
    onTurnstileSuccess: (token: string) => void;
    onTurnstileError: () => void;
    turnstile?: {
      render: (
        container: string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback': () => void;
        }
      ) => void;
    };
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPasswordComponent,
    InputEmailComponent,
    ButtonComponent,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent extends General implements OnInit {
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private _router = inject(Router);
  turnstileToken: string = '';
  turnstileSiteKey: string = environment.turnstileSiteKey;
  public isLoading$ = new BehaviorSubject<boolean>(false);

  formularioLogin = new FormGroup({
    turnstileToken: new FormControl('', [Validators.required]),
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

  ngOnInit(): void {
    this.loadTurnstileScript();
    window.onTurnstileSuccess = (token: string) =>
      this.onTurnstileSuccess(token);
    window.onTurnstileError = () => this.onTurnstileError();
    this.resetTurnstileWidget();
  }

  onTurnstileSuccess(token: string): void {
    this.turnstileToken = token;
    this.formularioLogin.get('turnstileToken')?.setValue(token);
    this.changeDetectorRef.detectChanges();
  }

  onTurnstileError(): void {
    console.error('Error al cargar Turnstile');
    this.turnstileToken = '';
    this.formularioLogin.get('turnstileToken')?.setValue('');
    this.changeDetectorRef.detectChanges();
  }

  resetTurnstileWidget() {
    const container = document.querySelector('.cf-turnstile');
    if (container) {
      container.innerHTML = '';
      if (window.turnstile) {
        window.turnstile.render('.cf-turnstile', {
          sitekey: this.turnstileSiteKey,
          callback: (token: string) => this.onTurnstileSuccess(token),
          'error-callback': () => this.onTurnstileError(),
        });
      }
    }
  }

  // Cargar el script de Turnstile dinámicamente
  private loadTurnstileScript(): void {
    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  enviar() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      this.formularioLogin.markAsDirty();
      return;
    }

    this.isLoading$.next(true);
    this.authService
      .login(this.formularioLogin.value)
      .pipe(
        catchError(() => {
          return of(null);
        }),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe((resultado: RespuestaLogin) => {
        if (resultado.token) {
          let calcularTiempo = new Date(
            new Date().getTime() + environment.sessionLifeTime * 60 * 60 * 1000
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
