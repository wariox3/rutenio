import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { getCookie } from 'typescript-cookie';
import { environment } from '../../../../../environments/environment';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';
import { PaginadorComponent } from '../../../../common/components/ui/paginacion/paginador/paginador.component';

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

interface RespuestaListado {
  count: number;
  page: number;
  page_size: number;
  results: UsuarioGlobal[];
  estadisticas: {
    total: number;
    activos: number;
    super_admins: number;
  };
}

type FiltroEstado = 'todos' | 'activos' | 'inactivos' | 'super_admin';

@Component({
  selector: 'app-contenedor-admin-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterLink,
    AdminNavComponent,
    PaginadorComponent,
  ],
  templateUrl: './contenedor-admin-usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorAdminUsuariosComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);

  cargando = signal<boolean>(true);
  usuarios = signal<UsuarioGlobal[]>([]);
  totalUsuarios = signal<number>(0);
  estadisticas = signal<{ total: number; activos: number; super_admins: number }>({
    total: 0,
    activos: 0,
    super_admins: 0,
  });
  pagina = signal<number>(1);
  porPagina = 25;
  Math = Math;

  busqueda = '';
  filtroEstado: FiltroEstado = 'todos';

  private busqueda$ = new Subject<string>();
  private destroy$ = new Subject<void>();

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
    this.busqueda$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pagina.set(1);
        this.cargar();
      });
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirDetalle(id: number) {
    this.router.navigate(['/admin/usuarios', id]);
  }

  onBusquedaChange(valor: string) {
    this.busqueda = valor;
    this.busqueda$.next(valor);
  }

  cambiarFiltroEstado(estado: FiltroEstado) {
    if (this.filtroEstado === estado) return;
    this.filtroEstado = estado;
    this.pagina.set(1);
    this.cargar();
  }

  onPageChange(page: number) {
    this.pagina.set(page);
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    const params = new URLSearchParams({
      page: String(this.pagina()),
      page_size: String(this.porPagina),
      estado: this.filtroEstado,
    });
    if (this.busqueda.trim()) {
      params.set('q', this.busqueda.trim());
    }
    this.http
      .get<RespuestaListado>(
        `${environment.url_api}/contenedor/usuario/admin-lista/?${params.toString()}`,
        { headers: this.headers },
      )
      .subscribe({
        next: (resp) => {
          this.usuarios.set(resp?.results || []);
          this.totalUsuarios.set(resp?.count || 0);
          if (resp?.estadisticas) this.estadisticas.set(resp.estadisticas);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  toggleActivo(u: UsuarioGlobal) {
    if (!confirm(`¿${u.is_active ? 'Desactivar' : 'Activar'} a ${u.username}?`)) return;
    this.http
      .post<{ is_active: boolean }>(
        `${environment.url_api}/contenedor/usuario/${u.id}/admin-toggle-activo/`,
        {},
        { headers: this.headers },
      )
      .subscribe({
        next: ({ is_active }) => {
          this.usuarios.update((lista) =>
            lista.map((x) => (x.id === u.id ? { ...x, is_active } : x)),
          );
          this.estadisticas.update((est) => ({
            ...est,
            activos: est.activos + (is_active ? 1 : -1),
          }));
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
          { headers: this.headers },
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
      (c) => c.id === this.contenedorElegido,
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
        { headers: this.headers },
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
            'Error al asignar: ' + (err?.error?.mensaje || 'Error inesperado'),
          );
        },
      });
  }

  hacerAdmin(usuario: UsuarioGlobal, contenedor: ContenedorRef) {
    if (
      !confirm(
        `¿Convertir a ${usuario.username} en administrador de "${contenedor.nombre || contenedor.schema_name}"?\n\nEl admin actual pasará a ser usuario regular.`,
      )
    ) {
      return;
    }
    this.http
      .post<{ mensaje: string; contenedor_id: number }>(
        `${environment.url_api}/contenedor/usuario/admin-cambiar-admin-contenedor/`,
        { usuario_id: usuario.id, schema_name: contenedor.schema_name },
        { headers: this.headers },
      )
      .subscribe({
        next: () => this.cargar(),
        error: (err) =>
          alert(
            'No se pudo cambiar el admin: ' +
              (err?.error?.mensaje || 'Error inesperado'),
          ),
      });
  }
}
