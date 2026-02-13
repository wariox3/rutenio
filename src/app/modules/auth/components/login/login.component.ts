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
import {
  BehaviorSubject,
  catchError,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { RespuestaLogin } from '../../types/auth.interface';
import { usuarioIniciar } from '../../../../redux/actions/auth/usuario.actions';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { NgxTurnstileModule, NgxTurnstileComponent } from 'ngx-turnstile';
import { ConfirmarInivitacion } from '../../types/informacion-perfil.type';
import { ViewChild } from '@angular/core';

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
    NgxTurnstileModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent extends General implements OnInit {
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private _router = inject(Router);
  @ViewChild(NgxTurnstileComponent) turnstileComponent!: NgxTurnstileComponent;
  turnstileToken: string = '';
  turnstileSiteKey: string = environment.turnstileSiteKey;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  isProduction: boolean = environment.production;
  enableTurnstile: boolean = environment.enableTurnstile;

  formularioLogin = new FormGroup({
    cf_turnstile_response: new FormControl(''),
    proyecto: new FormControl('RUTEO'),
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
    if (this.enableTurnstile) {
      this.formularioLogin
        .get('cf_turnstile_response')
        ?.addValidators([Validators.required]);
    }
  }

  onTurnstileSuccess(token: string): void {
    this.turnstileToken = token;
    this.formularioLogin.get('cf_turnstile_response')?.setValue(token);
    this.changeDetectorRef.detectChanges();
  }

  enviar() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      this.formularioLogin.markAsDirty();
      return;
    }

    const tokenUrl = this.activatedRoute.snapshot.paramMap.get('token');

    this.isLoading$.next(true);
    const loginData = { ...this.formularioLogin.value };
    
    // Solo incluir cf_turnstile_response si Turnstile está habilitado
    if (!this.enableTurnstile) {
      delete loginData.cf_turnstile_response;
    }
    
    this.authService
      .login(loginData)
      .pipe(
        tap((resultado: RespuestaLogin) => {
          if (resultado.token) {
            let calcularTiempo = new Date(
              new Date().getTime() +
                environment.sessionLifeTime * 60 * 60 * 1000
            );
            this.store.dispatch(
              usuarioIniciar({
                usuario: resultado.user,
              })
            );
            this.tokenService.guardar(resultado.token, calcularTiempo);
          }
        }),
        switchMap(() => {
          if (tokenUrl) {
            return this.authService.confirmarInivitacion(tokenUrl).pipe(
              catchError(() => {
                this._router.navigate(['contenedor']);
                return of(null);
              })
            );
          }
          return of(null);
        }),
        tap((resultado) => {
          this._router.navigate(['contenedor']);
          if (resultado.confirmar) {
            this.alerta.mensajaExitoso(
              'Se ha confirmado la invitación exitosamente.'
            );
          }
        }),
        catchError(() => {
          return of(null);
        }),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }

  get username() {
    return this.formularioLogin.get('username');
  }

  get password() {
    return this.formularioLogin.get('password');
  }
}
