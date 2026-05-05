import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';
import { ContenedorAdminService } from '../../services/contenedor-admin.service';

@Component({
  selector: 'app-contenedor-admin-usuario-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AdminNavComponent],
  templateUrl: './contenedor-admin-usuario-crear.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorAdminUsuarioCrearComponent {
  private fb = inject(FormBuilder);
  private adminService = inject(ContenedorAdminService);
  private router = inject(Router);

  enviando = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);
  modo = signal<'clave' | 'invitacion'>('clave');

  formulario = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    nombre: [''],
    apellido: [''],
    telefono: [''],
    password: [''],
  });

  cambiarModo(modo: 'clave' | 'invitacion') {
    this.modo.set(modo);
    const passwordCtrl = this.formulario.controls.password;
    if (modo === 'clave') {
      passwordCtrl.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      passwordCtrl.clearValidators();
      passwordCtrl.setValue('');
    }
    passwordCtrl.updateValueAndValidity();
  }

  enviar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.errorMensaje.set(null);
    const valor = this.formulario.value;
    const payload = {
      username: (valor.username || '').trim().toLowerCase(),
      nombre: valor.nombre || undefined,
      apellido: valor.apellido || undefined,
      telefono: valor.telefono || undefined,
      password: this.modo() === 'clave' ? valor.password || undefined : undefined,
      enviar_invitacion: this.modo() === 'invitacion',
    };
    this.adminService.crearUsuario(payload).subscribe({
      next: (res) => {
        this.enviando.set(false);
        const id = res?.usuario?.id;
        if (id) {
          this.router.navigate(['/admin/usuarios', id]);
        } else {
          this.router.navigate(['/admin/usuarios']);
        }
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorMensaje.set(
          err?.error?.mensaje || 'No se pudo crear el usuario. Verifica los datos.',
        );
      },
    });
  }
}
