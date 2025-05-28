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
import { AuthService } from '../../services/auth.service';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { General } from '../../../../common/clases/general';
import { environment } from '../../../../../environments/environment.development';
import { NgxTurnstileModule } from 'ngx-turnstile';

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
    NgxTurnstileModule,
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
  isProduction: boolean = environment.production;
  public isLoading$ = new BehaviorSubject<boolean>(false);

  formulario = new FormGroup({
    turnstileToken: new FormControl(''),
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

  ngOnInit(): void {
    if (this.isProduction) {
      this.formulario
        .get('cf_turnstile_response')
        ?.addValidators([Validators.required]);
    }
  }

  validarContrasena(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const clave = control.root.get('password')?.value;
      const confirmarClave = control.value;

      return clave === confirmarClave ? null : { clavesDiferentes: true };
    };
  }

  onTurnstileSuccess(token: string): void {
    this.turnstileToken = token;
    this.formulario.get('turnstileToken')?.setValue(token);
    this.changeDetectorRef.detectChanges();
  }

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
