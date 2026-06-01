import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { getCookie } from 'typescript-cookie';
import { AdminNavComponent } from '../../../../common/components/admin-nav/admin-nav.component';

interface ContenedorAdmin {
  id: number;
  schema_name: string;
  nombre: string;
  acceso_whatsapp: boolean;
  acceso_whatsapp_notificaciones: boolean;
  fecha: string;
  usuarios: number;
  whatsapp_phone_number_id?: string | null;
  whatsapp_display?: string | null;
  whatsapp_estado?: string | null;
  whatsapp_error_mensaje?: string | null;
}

interface NumeroMeta {
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string | null;
  quality_rating: string | null;
  code_verification_status: string | null;
  asignado_a: {
    contenedor_id: number;
    contenedor_nombre: string;
    schema_name: string;
    estado: string;
  } | null;
}

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-contenedor-admin-whatsapp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavComponent],
  templateUrl: './contenedor-admin-whatsapp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContenedorAdminWhatsappComponent implements OnInit {
  private http = inject(HttpClient);
  private _cdr = inject(ChangeDetectorRef);

  contenedores: ContenedorAdmin[] = [];
  numeros: NumeroMeta[] = [];
  cargando = true;
  cargandoNumeros = false;
  procesandoId: number | null = null;
  procesandoNotifId: number | null = null;

  controlBusqueda = new FormControl('');
  filtroEstado: FiltroEstado = 'todos';

  // Modal de asignación
  modalAbierto = false;
  contenedorSeleccionado: ContenedorAdmin | null = null;
  numeroSeleccionadoId: string | null = null;
  errorModal: string | null = null;
  errorNumeros: string | null = null;

  private readonly _coloresAvatar = [
    { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-200' },
    { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-200' },
    { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' },
    { bg: 'bg-gray-200', text: 'text-gray-700', ring: 'ring-gray-300' },
  ];

  private get headers(): HttpHeaders {
    const token = getCookie('admin_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.consultarContenedores();
    this.controlBusqueda.valueChanges.subscribe(() => this._cdr.markForCheck());
  }

  consultarContenedores() {
    this.cargando = true;
    this.http
      .get<ContenedorAdmin[]>(
        `${environment.url_api}/contenedor/contenedor/admin-lista/`,
        { headers: this.headers }
      )
      .subscribe({
        next: (resp) => {
          this.contenedores = resp;
          this.cargando = false;
          this._cdr.markForCheck();
        },
        error: () => { this.cargando = false; this._cdr.markForCheck(); },
      });
  }

  consultarNumeros() {
    this.cargandoNumeros = true;
    this.errorNumeros = null;
    this.http
      .get<{ data: NumeroMeta[] }>(
        `${environment.url_api}/contenedor/contenedor/admin-whatsapp/numeros/`,
        { headers: this.headers }
      )
      .subscribe({
        next: (resp) => {
          this.numeros = resp.data || [];
          this.cargandoNumeros = false;
          this._cdr.markForCheck();
        },
        error: (err) => {
          this.errorNumeros = err?.error?.mensaje || err?.message || 'No se pudieron cargar los números';
          this.cargandoNumeros = false;
          this._cdr.markForCheck();
        },
      });
  }

  onClickToggle(c: ContenedorAdmin) {
    if (this.procesandoId === c.id) return;
    if (c.acceso_whatsapp) {
      // Desactivar = desasignar
      if (!confirm(`¿Seguro querés desasignar el número de ${c.nombre}?`)) return;
      this._desasignar(c);
    } else {
      // Activar = abrir modal para elegir número
      this.abrirModal(c);
    }
  }

  abrirModal(c: ContenedorAdmin) {
    this.contenedorSeleccionado = c;
    this.numeroSeleccionadoId = null;
    this.errorModal = null;
    this.modalAbierto = true;
    this.consultarNumeros();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.contenedorSeleccionado = null;
    this.numeroSeleccionadoId = null;
    this.errorModal = null;
  }

  confirmarAsignacion() {
    if (!this.contenedorSeleccionado || !this.numeroSeleccionadoId) return;
    const c = this.contenedorSeleccionado;
    this.procesandoId = c.id;
    this.errorModal = null;
    this.http
      .post<{ mensaje: string; conexion: any }>(
        `${environment.url_api}/contenedor/contenedor/admin-whatsapp/asignar/`,
        { contenedor_id: c.id, phone_number_id: this.numeroSeleccionadoId },
        { headers: this.headers }
      )
      .subscribe({
        next: (resp) => {
          c.acceso_whatsapp = true;
          c.whatsapp_phone_number_id = resp.conexion?.phone_number_id;
          c.whatsapp_display = resp.conexion?.display_phone_number;
          c.whatsapp_estado = resp.conexion?.estado;
          c.whatsapp_error_mensaje = resp.conexion?.error_mensaje ?? null;
          this.procesandoId = null;
          this.cerrarModal();
          this._cdr.markForCheck();
        },
        error: (err) => {
          this.errorModal = err?.error?.mensaje || 'No se pudo asignar el número';
          this.procesandoId = null;
          this._cdr.markForCheck();
        },
      });
  }

  toggleNotificaciones(c: ContenedorAdmin) {
    if (this.procesandoNotifId === c.id) return;
    this.procesandoNotifId = c.id;
    this.http
      .post<{ mensaje: string; acceso_whatsapp_notificaciones: boolean }>(
        `${environment.url_api}/contenedor/contenedor/toggle-whatsapp-notificaciones/`,
        { id: c.id },
        { headers: this.headers }
      )
      .subscribe({
        next: (resp) => {
          c.acceso_whatsapp_notificaciones = resp.acceso_whatsapp_notificaciones;
          this.procesandoNotifId = null;
          this._cdr.markForCheck();
        },
        error: () => { this.procesandoNotifId = null; this._cdr.markForCheck(); },
      });
  }

  private _desasignar(c: ContenedorAdmin) {
    this.procesandoId = c.id;
    this.http
      .post<{ mensaje: string }>(
        `${environment.url_api}/contenedor/contenedor/admin-whatsapp/desasignar/`,
        { contenedor_id: c.id },
        { headers: this.headers }
      )
      .subscribe({
        next: () => {
          c.acceso_whatsapp = false;
          c.whatsapp_phone_number_id = null;
          c.whatsapp_display = null;
          c.whatsapp_estado = null;
          c.whatsapp_error_mensaje = null;
          this.procesandoId = null;
          this._cdr.markForCheck();
        },
        error: () => { this.procesandoId = null; this._cdr.markForCheck(); },
      });
  }

  // Helpers

  seleccionarFiltro(f: FiltroEstado) { this.filtroEstado = f; }

  get contenedoresFiltrados(): ContenedorAdmin[] {
    const q = (this.controlBusqueda.value || '').trim().toLowerCase();
    return this.contenedores.filter(c => {
      if (this.filtroEstado === 'activos' && !c.acceso_whatsapp) return false;
      if (this.filtroEstado === 'inactivos' && c.acceso_whatsapp) return false;
      if (!q) return true;
      return (
        (c.nombre || '').toLowerCase().includes(q) ||
        c.schema_name.toLowerCase().includes(q)
      );
    });
  }

  get totalActivos(): number { return this.contenedores.filter(c => c.acceso_whatsapp).length; }
  get totalInactivos(): number { return this.contenedores.length - this.totalActivos; }

  numeroYaAsignadoAOtro(n: NumeroMeta): boolean {
    if (!n.asignado_a) return false;
    return n.asignado_a.contenedor_id !== this.contenedorSeleccionado?.id;
  }

  iniciales(c: ContenedorAdmin): string {
    const nombre = (c.nombre || c.schema_name || '').trim();
    const partes = nombre.split(/\s+/).filter(Boolean);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  }

  colorAvatar(c: ContenedorAdmin): { bg: string; text: string; ring: string } {
    const key = c.schema_name || String(c.id);
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return this._coloresAvatar[hash % this._coloresAvatar.length];
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
  trackByPhoneId(_: number, item: NumeroMeta): string { return item.phone_number_id; }
}
