import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { usuarioActionActualizar } from '../../../../redux/actions/auth/usuario.actions';
import { obtenerUsuario } from '../../../../redux/selectors/usuario.selector';

function clavesIguales(control: AbstractControl): ValidationErrors | null {
  const a = control.get('password')?.value;
  const b = control.get('confirmacion')?.value;
  if (!a || !b) return null;
  return a === b ? null : { clavesDiferentes: true };
}

@Component({
  selector: 'app-cambio-clave-obligatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambio-clave-obligatorio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CambioClaveObligatorioComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private store = inject(Store);
  private router = inject(Router);

  enviando = signal<boolean>(false);
  error = signal<string | null>(null);

  formulario = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: [clavesIguales] },
  );

  enviar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.store
      .select(obtenerUsuario)
      .pipe(take(1))
      .subscribe((usuario) => {
        if (!usuario?.id) {
          this.error.set('Sesion no valida. Inicia sesion de nuevo.');
          return;
        }
        this.enviando.set(true);
        this.error.set(null);
        this.http
          .post<{ cambio: boolean }>(
            `${environment.url_api}/contenedor/usuario/cambio-clave/`,
            { usuario_id: usuario.id, password: this.formulario.value.password },
          )
          .subscribe({
            next: () => {
              this.enviando.set(false);
              this.store.dispatch(
                usuarioActionActualizar({ usuario: { debe_cambiar_clave: false } }),
              );
              this.router.navigate(['contenedor']);
            },
            error: (err) => {
              this.enviando.set(false);
              this.error.set(err?.error?.mensaje || 'No se pudo cambiar la clave.');
            },
          });
      });
  }
}
