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
import { RespuestaRegistro } from '../../types/auth.interface';
import { AuthService } from '../../services/auth.service';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputPasswordComponent } from '../../../../common/components/ui/form/input-password/input-password.component';
import { General } from '../../../../common/clases/general';
import { environment } from '../../../../../environments/environment.development';
import { NgxTurnstileModule, NgxTurnstileComponent } from 'ngx-turnstile';
import { ViewChild } from '@angular/core';

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
  @ViewChild(NgxTurnstileComponent) turnstileComponent!: NgxTurnstileComponent;
  turnstileToken: string = '';
  turnstileSiteKey: string = environment.turnstileSiteKey;
  isProduction: boolean = environment.production;
  enableTurnstile: boolean = environment.enableTurnstile;
  public isLoading$ = new BehaviorSubject<boolean>(false);

  formulario = new FormGroup({
    cf_turnstile_response: new FormControl(''),
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
    if (this.enableTurnstile) {
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
    this.formulario.get('cf_turnstile_response')?.setValue(token);
    this.changeDetectorRef.detectChanges();
  }

  enviar() {
    this.registrando$.next(true);
    
    const registroData = { ...this.formulario.value };
    
    // Solo incluir cf_turnstile_response si Turnstile está habilitado
    if (!this.enableTurnstile) {
      delete registroData.cf_turnstile_response;
    }
    
    this.authService
      .registro(registroData)
      .pipe(finalize(() => this.registrando$.next(false)))
      .subscribe((resultado: RespuestaRegistro) => {
        if (resultado.usuario.id) {
          this.alerta.mensajaExitoso('Se ha creado el usuario exitosamente.');
          this._router.navigate(['auth/login']);
        }
      });
  }
}
