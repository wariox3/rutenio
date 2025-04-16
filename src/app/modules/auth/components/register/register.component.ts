import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { RespuestaRegistro } from '../../../../interfaces/auth/auth.interface';
import { AuthService } from '../services/auth.service';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { General } from '../../../../common/clases/general';
import { environment } from '../../../../../environments/environment.development';

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
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputEmailComponent,
    InputPasswordComponent,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterComponent extends General implements OnInit {
  private authService = inject(AuthService);
  private _router = inject(Router);
  public registrando$ = new BehaviorSubject<boolean>(false);
  turnstileToken: string = '';
  turnstileSiteKey: string = environment.turnstileSiteKey;
  public isLoading$ = new BehaviorSubject<boolean>(false);

  validarContrasena(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const clave = control.root.get('password')?.value;
      const confirmarClave = control.value;

      return clave === confirmarClave ? null : { clavesDiferentes: true };
    };
  }

  ngOnInit(): void {
    this.loadTurnstileScript();
    window.onTurnstileSuccess = (token: string) =>
      this.onTurnstileSuccess(token);
    window.onTurnstileError = () => this.onTurnstileError();
    this.resetTurnstileWidget();
  }

  onTurnstileSuccess(token: string): void {
    this.turnstileToken = token;
    this.formulario.get('turnstileToken')?.setValue(token);
    this.changeDetectorRef.detectChanges();
  }

  onTurnstileError(): void {
    console.error('Error al cargar Turnstile');
    this.turnstileToken = '';
    this.formulario.get('turnstileToken')?.setValue('');
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

  formulario = new FormGroup({
    turnstileToken: new FormControl('', [Validators.required]),
    username: new FormControl('', Validators.required),
    password: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
      ])
    ),
    confirmarContrasena: new FormControl('', [
      Validators.required,
      this.validarContrasena(),
    ]),
    terminoCondicion: new FormControl(
      '',
      Validators.compose([Validators.requiredTrue])
    ),
  });

  enviar() {
    this.registrando$.next(true);
    this.authService
      .registro(this.formulario.value)
      .pipe(finalize(() => this.registrando$.next(false)))
      .subscribe((resultado: RespuestaRegistro) => {
        if (resultado.usuario.id) {
          this.alerta.mensajaExitoso('Se ha creado el usuario exitosamente.');
          this._router.navigate(['auth/login']);
        }
      });
  }
}
