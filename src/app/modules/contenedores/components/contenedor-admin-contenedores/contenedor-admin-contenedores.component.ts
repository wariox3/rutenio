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

  cargando = signal<boolean>(true);
  contenedores = signal<ContenedorGlobal[]>([]);
  busqueda = '';

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
