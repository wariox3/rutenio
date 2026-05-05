import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ContenedorAdminService,
  MODULOS_PERMISOS,
  ModuloPermiso,
  PermisosMembresia,
  Plantilla,
} from '../../services/contenedor-admin.service';
import { ContenedorService } from '../../services/contenedor.service';

interface MembresiaEditable {
  id: number;
  contenedor__nombre?: string;
  contenedor__schema_name?: string;
  tiene_acceso_web: boolean;
  tiene_acceso_movil: boolean;
  perfil_movil: 'conductor' | 'coordinador' | null;
  permisos: PermisosMembresia | null;
}

@Component({
  selector: 'app-contenedor-admin-membresia-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contenedor-admin-membresia-editar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContenedorAdminMembresiaEditarComponent {
  private adminService = inject(ContenedorAdminService);
  private contenedorService = inject(ContenedorService);

  @Input({ required: true }) membresia!: MembresiaEditable;
  /**
   * 'super-admin' (default) usa el cookie admin_token contra ContenedorAdminService.
   * 'admin-contenedor' usa el token regular del usuario via ContenedorService.
   */
  @Input() flujo: 'super-admin' | 'admin-contenedor' = 'super-admin';
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();

  modulos = MODULOS_PERMISOS;
  guardando = signal<boolean>(false);
  error = signal<string | null>(null);

  permisoLocal: PermisosMembresia = {};
  tieneAccesoWeb = true;
  tieneAccesoMovil = false;
  perfilMovil: 'conductor' | 'coordinador' | null = null;

  ngOnInit() {
    this.tieneAccesoWeb = !!this.membresia.tiene_acceso_web;
    this.tieneAccesoMovil = !!this.membresia.tiene_acceso_movil;
    this.perfilMovil = this.membresia.perfil_movil || null;
    const base: PermisosMembresia = {};
    for (const m of this.modulos) {
      const existente = this.membresia.permisos?.[m];
      base[m] = {
        ver: !!existente?.ver,
        editar: !!existente?.editar,
      };
    }
    this.permisoLocal = base;
  }

  toggle(modulo: ModuloPermiso, accion: 'ver' | 'editar') {
    const p = this.permisoLocal[modulo];
    p[accion] = !p[accion];
    if (accion === 'ver' && !p.ver) {
      // si no puede ver, tampoco puede editar
      p.editar = false;
    }
    if (accion === 'editar' && p.editar) {
      // si puede editar, debe poder ver
      p.ver = true;
    }
  }

  aplicarPlantilla(plantilla: Plantilla) {
    const editar = plantilla !== 'consulta';
    for (const m of this.modulos) {
      this.permisoLocal[m] = { ver: true, editar };
    }
  }

  guardar() {
    this.guardando.set(true);
    this.error.set(null);
    const payload = {
      tiene_acceso_web: this.tieneAccesoWeb,
      tiene_acceso_movil: this.tieneAccesoMovil,
      perfil_movil: this.tieneAccesoMovil ? this.perfilMovil : null,
      permisos: this.permisoLocal,
    };
    const obs$ =
      this.flujo === 'super-admin'
        ? this.adminService.actualizarMembresia(this.membresia.id, payload)
        : this.contenedorService.actualizarMembresia(this.membresia.id, payload);
    obs$.subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.guardado.emit(res);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err?.error?.mensaje || 'No se pudo guardar.');
      },
    });
  }
}
