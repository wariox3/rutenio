import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, finalize, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { setCookie } from 'typescript-cookie';
import { noRequiereToken } from '../../../../common/interceptors/token.interceptor';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPasswordComponent,
    InputEmailComponent,
    ButtonComponent,
  ],
  templateUrl: './admin-login.component.html',
})
export default class AdminLoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public errorMensaje: string | null = null;

  formularioLogin = new FormGroup({
    username: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  enviar() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.isLoading$.next(true);
    this.errorMensaje = null;

    this.http
      .post<any>(
        `${environment.url_api}/seguridad/admin-login/`,
        this.formularioLogin.value,
        { context: noRequiereToken() }
      )
      .pipe(
        tap((resultado) => {
          const expira = new Date(
            new Date().getTime() + environment.sessionLifeTime * 60 * 60 * 1000
          );
          setCookie('admin_token', resultado.token, {
            expires: expira,
            path: '/',
          });
          this.router.navigate(['/admin/whatsapp']);
        }),
        catchError((error) => {
          this.errorMensaje =
            error?.error?.error || 'Error al iniciar sesión';
          return of(null);
        }),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }
}
