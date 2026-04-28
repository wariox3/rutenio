import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { General } from '../../../../common/clases/general';
import {
  ContenedorGlobal,
  SuperAdminService,
} from '../../services/super-admin.service';

@Component({
  selector: 'app-contenedores-global',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './contenedores-global.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedoresGlobalComponent
  extends General
  implements OnInit
{
  private _service = inject(SuperAdminService);

  public cargando = signal<boolean>(true);
  public contenedores = signal<ContenedorGlobal[]>([]);
  public busqueda = '';

  ngOnInit(): void {
    this._cargar();
  }

  private _cargar() {
    this.cargando.set(true);
    this._service.listarContenedores().subscribe({
      next: (lista) => {
        this.contenedores.set(lista || []);
        this.cargando.set(false);
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.cargando.set(false);
        this.alerta.mensajeError(
          'Error',
          'No se pudieron cargar los contenedores'
        );
      },
    });
  }

  recargar() {
    this._cargar();
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

  get totalContenedores(): number {
    return this.contenedores().length;
  }

  get totalConWhatsapp(): number {
    return this.contenedores().filter((c) => c.whatsapp_phone_number_id).length;
  }

  whatsappEstadoBadge(c: ContenedorGlobal): { texto: string; clase: string } {
    if (!c.whatsapp_phone_number_id) {
      return { texto: 'Sin conectar', clase: 'badge-light' };
    }
    if (c.whatsapp_estado === 'activo') {
      return { texto: 'Activo', clase: 'badge-success' };
    }
    if (c.whatsapp_estado === 'pendiente') {
      return { texto: 'Pendiente', clase: 'badge-warning' };
    }
    if (c.whatsapp_estado === 'error') {
      return { texto: 'Error', clase: 'badge-danger' };
    }
    return { texto: c.whatsapp_estado || '—', clase: 'badge-light' };
  }
}
