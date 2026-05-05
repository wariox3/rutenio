import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getCookie } from 'typescript-cookie';
import { environment } from '../../../../../environments/environment';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';

interface ContenedorRef {
  nombre: string;
  schema_name: string;
  rol?: string;
}

interface UsuarioGlobal {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  verificado: boolean;
  fecha_creacion: string;
  admin_de: ContenedorRef[];
  invitado_a: ContenedorRef[];
}

interface ContenedorOpcion {
  id: number;
  schema_name: string;
  nombre: string;
}

@Component({
  selector: 'app-contenedor-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterLink, AdminNavComponent],
  templateUrl: './contenedor-admin-usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorAdminUsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  abrirDetalle(id: number) {
    this.router.navigate(['/admin/usuarios', id]);
  }

  cargando = signal<boolean>(true);
  usuarios = signal<UsuarioGlobal[]>([]);
  busqueda = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' | 'super_admin' = 'todos';

  // Modal asignar contenedor
  modalAsignar = signal<boolean>(false);
  usuarioSeleccionado = signal<UsuarioGlobal | null>(null);
  contenedoresDisponibles = signal<ContenedorOpcion[]>([]);
  contenedorElegido: number | null = null;
  rolAsignar: 'admin' | 'usuario' = 'usuario';
  asignando = signal<boolean>(false);

  private get headers(): HttpHeaders {
    const token = getCookie('admin_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.http
      .get<UsuarioGlobal[]>(
        `${environment.url_api}/contenedor/usuario/admin-lista/`,
        { headers: this.headers }
      )
      .subscribe({
        next: (lista) => {
          this.usuarios.set(lista || []);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }

  toggleActivo(u: UsuarioGlobal) {
    if (!confirm(`¿${u.is_active ? 'Desactivar' : 'Activar'} a ${u.username}?`)) return;
    this.http
      .post<{ is_active: boolean }>(
        `${environment.url_api}/contenedor/usuario/${u.id}/admin-toggle-activo/`,
        {},
        { headers: this.headers }
      )
      .subscribe({
        next: ({ is_active }) => {
          this.usuarios.update((lista) =>
            lista.map((x) => (x.id === u.id ? { ...x, is_active } : x))
          );
        },
      });
  }

  abrirModalAsignar(u: UsuarioGlobal) {
    this.usuarioSeleccionado.set(u);
    this.contenedorElegido = null;
    this.rolAsignar = 'usuario';
    this.modalAsignar.set(true);
    if (this.contenedoresDisponibles().length === 0) {
      this.http
        .get<ContenedorOpcion[]>(
          `${environment.url_api}/contenedor/contenedor/admin-lista/`,
          { headers: this.headers }
        )
        .subscribe((lista) => this.contenedoresDisponibles.set(lista || []));
    }
  }

  cerrarModalAsignar() {
    this.modalAsignar.set(false);
    this.usuarioSeleccionado.set(null);
  }

  confirmarAsignacion() {
    const u = this.usuarioSeleccionado();
    if (!u || !this.contenedorElegido) return;
    const contenedor = this.contenedoresDisponibles().find(
      (c) => c.id === this.contenedorElegido
    );
    if (!contenedor) return;
    this.asignando.set(true);
    this.http
      .post<{ mensaje: string }>(
        `${environment.url_api}/contenedor/usuario/admin-asignar-contenedor/`,
        {
          usuario_id: u.id,
          schema_name: contenedor.schema_name,
          rol: this.rolAsignar,
        },
        { headers: this.headers }
      )
      .subscribe({
        next: () => {
          this.asignando.set(false);
          this.cerrarModalAsignar();
          this.cargar();
        },
        error: (err) => {
          this.asignando.set(false);
          alert(
            'Error al asignar: ' +
              (err?.error?.mensaje || 'Error inesperado')
          );
        },
      });
  }

  hacerAdmin(usuario: UsuarioGlobal, contenedor: ContenedorRef) {
    if (
      !confirm(
        `¿Convertir a ${usuario.username} en administrador de "${contenedor.nombre || contenedor.schema_name}"?\n\nEl admin actual pasará a ser usuario regular.`
      )
    ) {
      return;
    }
    this.http
      .post<{ mensaje: string; contenedor_id: number }>(
        `${environment.url_api}/contenedor/usuario/admin-cambiar-admin-contenedor/`,
        { usuario_id: usuario.id, schema_name: contenedor.schema_name },
        { headers: this.headers }
      )
      .subscribe({
        next: () => {
          this.cargar();
        },
        error: (err) => {
          alert(
            'No se pudo cambiar el admin: ' +
              (err?.error?.mensaje || 'Error inesperado')
          );
        },
      });
  }

  get usuariosFiltrados(): UsuarioGlobal[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.usuarios().filter((u) => {
      if (this.filtroEstado === 'activos' && !u.is_active) return false;
      if (this.filtroEstado === 'inactivos' && u.is_active) return false;
      if (this.filtroEstado === 'super_admin' && !u.is_superuser) return false;
      if (!q) return true;
      return (
        (u.username || '').toLowerCase().includes(q) ||
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.apellido || '').toLowerCase().includes(q)
      );
    });
  }

  get totalActivos(): number {
    return this.usuarios().filter((u) => u.is_active).length;
  }

  get totalSuperAdmins(): number {
    return this.usuarios().filter((u) => u.is_superuser).length;
  }
}
