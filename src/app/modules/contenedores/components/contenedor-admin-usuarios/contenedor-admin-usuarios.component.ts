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

@Component({
  selector: 'app-contenedor-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, AdminNavComponent],
  templateUrl: './contenedor-admin-usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorAdminUsuariosComponent implements OnInit {
  private http = inject(HttpClient);

  cargando = signal<boolean>(true);
  usuarios = signal<UsuarioGlobal[]>([]);
  busqueda = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' | 'super_admin' = 'todos';

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
