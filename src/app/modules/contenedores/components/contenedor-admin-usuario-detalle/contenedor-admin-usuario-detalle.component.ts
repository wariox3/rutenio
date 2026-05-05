import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';
import { ContenedorAdminService } from '../../services/contenedor-admin.service';
import { ContenedorAdminMembresiaEditarComponent } from '../contenedor-admin-membresia-editar/contenedor-admin-membresia-editar.component';

interface MembresiaDetalle {
  id: number;
  contenedor_id: number;
  contenedor__nombre?: string;
  contenedor__schema_name?: string;
  rol: string;
  tiene_acceso_web: boolean;
  tiene_acceso_movil: boolean;
  perfil_web: string | null;
  perfil_movil: 'conductor' | 'coordinador' | null;
  permisos: any;
}

@Component({
  selector: 'app-contenedor-admin-usuario-detalle',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AdminNavComponent,
    ContenedorAdminMembresiaEditarComponent,
  ],
  templateUrl: './contenedor-admin-usuario-detalle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorAdminUsuarioDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(ContenedorAdminService);
  private fb = inject(FormBuilder);

  cargando = signal<boolean>(true);
  usuario = signal<any>(null);
  membresias = signal<MembresiaDetalle[]>([]);
  membresiaEditando = signal<MembresiaDetalle | null>(null);

  modalReset = signal<boolean>(false);
  reseteando = signal<boolean>(false);
  errorReset = signal<string | null>(null);
  formReset = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  modalEditar = signal<boolean>(false);
  guardandoEditar = signal<boolean>(false);
  formEditar = this.fb.group({
    nombre: [''],
    apellido: [''],
    telefono: [''],
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) this.cargar(id);
    });
  }

  cargar(id: number) {
    this.cargando.set(true);
    this.adminService.obtenerUsuario(id).subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.formEditar.patchValue({
          nombre: u?.nombre || '',
          apellido: u?.apellido || '',
          telefono: u?.telefono || '',
        });
        this.adminService.obtenerMembresiasDeUsuario(id).subscribe({
          next: (resp) => {
            this.membresias.set(resp?.results || []);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false),
        });
      },
      error: () => this.cargando.set(false),
    });
  }

  toggleActivo() {
    const u = this.usuario();
    if (!u) return;
    if (!confirm(`¿${u.is_active ? 'Desactivar' : 'Activar'} a ${u.username}?`)) return;
    this.adminService.toggleActivo(u.id).subscribe({
      next: ({ is_active }) => {
        this.usuario.set({ ...u, is_active });
      },
    });
  }

  abrirReset() {
    this.formReset.reset();
    this.errorReset.set(null);
    this.modalReset.set(true);
  }

  confirmarReset() {
    if (this.formReset.invalid) {
      this.formReset.markAllAsTouched();
      return;
    }
    const u = this.usuario();
    if (!u) return;
    this.reseteando.set(true);
    this.errorReset.set(null);
    this.adminService
      .resetPassword(u.id, this.formReset.value.password!)
      .subscribe({
        next: () => {
          this.reseteando.set(false);
          this.modalReset.set(false);
        },
        error: (err) => {
          this.reseteando.set(false);
          this.errorReset.set(err?.error?.mensaje || 'No se pudo restablecer.');
        },
      });
  }

  abrirEditar() {
    this.modalEditar.set(true);
  }

  guardarEditar() {
    const u = this.usuario();
    if (!u) return;
    this.guardandoEditar.set(true);
    this.adminService
      .actualizarUsuario(u.id, this.formEditar.value)
      .subscribe({
        next: (resp) => {
          this.guardandoEditar.set(false);
          this.modalEditar.set(false);
          if (resp?.usuario) this.usuario.set(resp.usuario);
        },
        error: () => this.guardandoEditar.set(false),
      });
  }

  abrirEditarMembresia(m: MembresiaDetalle) {
    this.membresiaEditando.set(m);
  }

  cerrarEditarMembresia() {
    this.membresiaEditando.set(null);
  }

  membresiaGuardada(actualizada: MembresiaDetalle) {
    this.membresias.update((lista) =>
      lista.map((m) => (m.id === actualizada.id ? { ...m, ...actualizada } : m)),
    );
    this.cerrarEditarMembresia();
  }

  resumenPermisos(m: MembresiaDetalle): string {
    if (!m.permisos) return 'Sin permisos';
    const total = Object.keys(m.permisos).length;
    const ver = Object.values<any>(m.permisos).filter((p) => p?.ver).length;
    const editar = Object.values<any>(m.permisos).filter((p) => p?.editar).length;
    return `${ver}/${total} ver · ${editar}/${total} editar`;
  }

  // ---- Hacer admin de un contenedor donde ya es miembro ----

  hacerAdminEnContenedor(m: MembresiaDetalle) {
    const u = this.usuario();
    if (!u || !m.contenedor__schema_name) return;
    const nombre = m.contenedor__nombre || m.contenedor__schema_name;
    if (
      !confirm(
        `¿Convertir a ${u.username} en administrador de "${nombre}"?\n\nEl admin actual pasará a ser usuario regular.`,
      )
    )
      return;
    this.adminService
      .cambiarAdminContenedor(u.id, m.contenedor__schema_name)
      .subscribe({
        next: () => this.cargar(u.id),
        error: (err) =>
          alert('No se pudo cambiar el admin: ' + (err?.error?.mensaje || 'Error inesperado')),
      });
  }

  // ---- Asignar a un contenedor donde no es miembro ----

  modalAsignar = signal<boolean>(false);
  contenedoresDisponibles = signal<Array<{ id: number; schema_name: string; nombre: string }>>([]);
  schemaElegido: string | null = null;
  rolAsignar: 'admin' | 'usuario' = 'usuario';
  asignando = signal<boolean>(false);
  errorAsignar = signal<string | null>(null);

  abrirModalAsignar() {
    this.schemaElegido = null;
    this.rolAsignar = 'usuario';
    this.errorAsignar.set(null);
    this.modalAsignar.set(true);
    if (this.contenedoresDisponibles().length === 0) {
      this.adminService.listaContenedoresAdmin().subscribe({
        next: (lista) => this.contenedoresDisponibles.set(lista || []),
      });
    }
  }

  cerrarModalAsignar() {
    this.modalAsignar.set(false);
  }

  /** Devuelve true si el usuario aun no es miembro de ese contenedor (para filtrar el select). */
  esContenedorDisponible(c: { id: number }): boolean {
    return !this.membresias().some((m) => m.contenedor_id === c.id);
  }

  confirmarAsignacion() {
    const u = this.usuario();
    if (!u || !this.schemaElegido) return;
    this.asignando.set(true);
    this.errorAsignar.set(null);
    this.adminService
      .asignarContenedor(u.id, this.schemaElegido, this.rolAsignar)
      .subscribe({
        next: () => {
          this.asignando.set(false);
          this.modalAsignar.set(false);
          this.cargar(u.id);
        },
        error: (err) => {
          this.asignando.set(false);
          this.errorAsignar.set(err?.error?.mensaje || 'No se pudo asignar.');
        },
      });
  }
}
