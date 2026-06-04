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
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { getCookie } from 'typescript-cookie';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';
import { ContenedorActionInit } from '../../../../redux/actions/contenedor/contenedor.actions';
import { empresaActionInit } from '../../../../redux/actions/empresa/empresa.actions';
import { configuracionActionInit } from '../../../../redux/actions/configuracion/configuracion.actions';
import { EmpresaService } from '../../../empresa/servicios/empresa.service';
import { GeneralApiService } from '../../../../core/api/general-api.service';

interface ContenedorGlobal {
  id: number;
  schema_name: string;
  nombre: string;
  fecha: string;
  usuarios: number;
  acceso_whatsapp: boolean;
  acceso_whatsapp_notificaciones: boolean;
  whatsapp_phone_number_id: string | null;
  whatsapp_display: string | null;
  whatsapp_estado: string | null;
}

@Component({
  selector: 'app-contenedor-admin-contenedores',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, AdminNavComponent],
  templateUrl: './contenedor-admin-contenedores.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorAdminContenedoresComponent implements OnInit {
  private http = inject(HttpClient);
  private store = inject(Store);
  private router = inject(Router);
  private _empresaService = inject(EmpresaService);
  private _generalApiService = inject(GeneralApiService);

  cargando = signal<boolean>(true);
  contenedores = signal<ContenedorGlobal[]>([]);
  busqueda = '';
  accediendoId = signal<number | null>(null);

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
      .get<ContenedorGlobal[]>(
        `${environment.url_api}/contenedor/contenedor/admin-lista/`,
        { headers: this.headers }
      )
      .subscribe({
        next: (lista) => {
          this.contenedores.set(lista || []);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }

  get contenedoresFiltrados(): ContenedorGlobal[] {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.contenedores();
    return this.contenedores().filter(
      (c) =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.schema_name || '').toLowerCase().includes(q)
    );
  }

  get totalUsuarios(): number {
    return this.contenedores().reduce((sum, c) => sum + (c.usuarios || 0), 0);
  }

  get totalConWhatsapp(): number {
    return this.contenedores().filter((c) => c.whatsapp_phone_number_id).length;
  }

  acceder(c: ContenedorGlobal) {
    if (this.accediendoId()) return;
    this.accediendoId.set(c.id);
    // Pedir el detalle del contenedor desde el endpoint público (auth normal del user)
    this.http
      .get<any>(`${environment.url_api}/contenedor/contenedor/${c.id}/`)
      .pipe(
        switchMap((resp) => {
          this.store.dispatch(
            ContenedorActionInit({
              contenedor: {
                nombre: resp.nombre,
                imagen: resp.imagen,
                contenedor_id: resp.id,
                subdominio: resp.subdominio,
                id: resp.id,
                usuario_id: resp.usuario_id,
                seleccion: true,
                rol: 'propietario',
                perfil_web: null,
                perfil_movil: null,
                plan_id: resp.plan_id,
                plan_nombre: resp.plan_nombre,
                usuarios: resp.plan_limite_usuarios,
                usuarios_base: resp.plan_usuarios_base,
                reddoc: resp.reddoc,
                ruteo: resp.ruteo,
                acceso_restringido: resp.acceso_restringido,
              } as any,
            })
          );
          // Hidratar empresa y configuracion del contenedor en el store. Sin
          // esto, la direccion de origen queda vacia y el modal "Configurar
          // direccion" salta en falso al entrar desde el panel admin.
          return forkJoin({
            empresa: this._empresaService.detalle().pipe(catchError(() => of(null))),
            configuracion: this._generalApiService
              .getConfiguracion(1)
              .pipe(catchError(() => of(null))),
          });
        })
      )
      .subscribe({
        next: ({ empresa, configuracion }) => {
          if (empresa) {
            this.store.dispatch(empresaActionInit({ empresa }));
          }
          if (configuracion) {
            this.store.dispatch(configuracionActionInit({ configuracion }));
          }
          this.accediendoId.set(null);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.accediendoId.set(null);
          alert(
            'No se pudo acceder al contenedor: ' +
              (err?.error?.mensaje || 'Verifica que tu sesión esté iniciada como super admin en el dashboard.')
          );
        },
      });
  }

  whatsappEstadoBadge(c: ContenedorGlobal): { texto: string; clase: string } {
    if (!c.whatsapp_phone_number_id) {
      return { texto: 'Sin conectar', clase: 'bg-gray-700 text-gray-300' };
    }
    if (c.whatsapp_estado === 'activo') {
      return { texto: 'Activo', clase: 'bg-green-500/20 text-green-400' };
    }
    if (c.whatsapp_estado === 'pendiente') {
      return { texto: 'Pendiente', clase: 'bg-yellow-500/20 text-yellow-400' };
    }
    if (c.whatsapp_estado === 'error') {
      return { texto: 'Error', clase: 'bg-red-500/20 text-red-400' };
    }
    return {
      texto: c.whatsapp_estado || '—',
      clase: 'bg-gray-700 text-gray-300',
    };
  }
}
