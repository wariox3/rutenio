import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { filter, interval, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { MensajeriaApiService } from '../../servicios/mensajeria-api.service';
import { Conversacion } from '../../interfaces/conversacion.interface';
import { Mensaje } from '../../interfaces/mensaje.interface';
import { AlertaService } from '../../../../common/services/alerta.service';
import { NuevaConversacionModalComponent } from '../nueva-conversacion-modal/nueva-conversacion-modal.component';

@Component({
  selector: 'app-mensajeria-inbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, NuevaConversacionModalComponent],
  templateUrl: './inbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InboxComponent implements OnInit, AfterViewChecked {
  private _api = inject(MensajeriaApiService);
  private _alerta = inject(AlertaService);
  private _cdr = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  private _detenerMensajes$ = new Subject<void>();
  private _scrollPendiente = false;
  private _ultimoLenMensajes = 0;
  private _ultimaConversacionId: number | null = null;

  @ViewChild('mensajesContenedor') mensajesContenedor?: ElementRef<HTMLDivElement>;

  conversaciones: Conversacion[] = [];
  conversacionActiva: Conversacion | null = null;
  mensajes: Mensaje[] = [];
  cargandoConversaciones = true;
  cargandoMensajes = false;
  enviando = false;
  controlTexto = new FormControl('');
  controlBusqueda = new FormControl('');
  modalNuevaAbierto = false;

  readonly POLLING_MS = 5000;
  pestanaVisible = !document.hidden;

  private readonly _coloresAvatar = [
    { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-200' },
    { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-200' },
    { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' },
    { bg: 'bg-gray-200', text: 'text-gray-700', ring: 'ring-gray-300' },
  ];

  ngOnInit(): void {
    interval(this.POLLING_MS).pipe(
      startWith(0),
      // Pausar polling cuando la pestana esta oculta (ahorro de bateria/red).
      filter(() => this.pestanaVisible),
      switchMap(() => this._api.listarConversaciones({ estado: 'abierta' })),
      takeUntilDestroyed(this._destroyRef),
    ).subscribe({
      next: (resp) => {
        this.conversaciones = resp.results;
        this.cargandoConversaciones = false;
        if (this.conversacionActiva) {
          const actualizada = resp.results.find(c => c.id === this.conversacionActiva!.id);
          if (actualizada) this.conversacionActiva = actualizada;
        }
        this._cdr.detectChanges();
      },
      error: () => {
        this.cargandoConversaciones = false;
        this._cdr.detectChanges();
      },
    });
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    this.pestanaVisible = !document.hidden;
  }

  ngAfterViewChecked(): void {
    if (this._scrollPendiente && this.mensajesContenedor) {
      const el = this.mensajesContenedor.nativeElement;
      el.scrollTop = el.scrollHeight;
      this._scrollPendiente = false;
    }
  }

  get conversacionesFiltradas(): Conversacion[] {
    const q = (this.controlBusqueda.value || '').trim().toLowerCase();
    if (!q) return this.conversaciones;
    return this.conversaciones.filter(c =>
      (c.cliente_nombre || '').toLowerCase().includes(q) ||
      c.cliente_telefono.includes(q)
    );
  }

  seleccionar(conv: Conversacion): void {
    this.conversacionActiva = conv;
    this.mensajes = [];
    this._ultimoLenMensajes = 0;
    this._ultimaConversacionId = conv.id;
    this._scrollPendiente = true;
    this._detenerMensajes$.next();
    this._iniciarPollingMensajes(conv.id);
    if (conv.no_leidos > 0) {
      this._api.marcarLeido(conv.id).subscribe(() => {
        conv.no_leidos = 0;
        this._cdr.detectChanges();
      });
    }
  }

  volverALista(): void {
    this.conversacionActiva = null;
    this._detenerMensajes$.next();
    this._cdr.detectChanges();
  }

  private _iniciarPollingMensajes(conversacionId: number): void {
    this.cargandoMensajes = true;
    interval(this.POLLING_MS).pipe(
      startWith(0),
      filter(() => this.pestanaVisible),
      switchMap(() => this._api.listarMensajes(conversacionId)),
      takeUntil(this._detenerMensajes$),
      takeUntilDestroyed(this._destroyRef),
    ).subscribe({
      next: (mensajes) => {
        const crecio = mensajes.length > this._ultimoLenMensajes;
        this.mensajes = mensajes;
        this._ultimoLenMensajes = mensajes.length;
        this.cargandoMensajes = false;
        if (crecio) this._scrollPendiente = true;
        this._cdr.detectChanges();
      },
      error: () => {
        this.cargandoMensajes = false;
        this._cdr.detectChanges();
      },
    });
  }

  enviar(): void {
    const texto = (this.controlTexto.value || '').trim();
    if (!texto || !this.conversacionActiva || this.enviando) return;
    if (this.ventana24hVencida) {
      this._alerta.mensajeError(
        'Ventana de 24h vencida',
        'WhatsApp solo permite plantillas pre-aprobadas. Espera a que el cliente escriba.',
      );
      return;
    }

    this.enviando = true;
    this._api.enviarMensaje(this.conversacionActiva.id, { tipo: 'texto', contenido: texto })
      .subscribe({
        next: (resp) => {
          this.enviando = false;
          if (resp.ok) {
            this.controlTexto.reset('');
            this._scrollPendiente = true;
          } else {
            this._alerta.mensajeError('No se envió', resp.mensaje || 'Error desconocido');
          }
          this._cdr.detectChanges();
        },
        error: (err) => {
          this.enviando = false;
          // Caso especial: ventana 24h vencida (codigo backend).
          if (err?.error?.codigo === 'ventana_24h_vencida') {
            this._alerta.mensajeError(
              'Ventana de 24h vencida',
              err.error.detail || 'Solo se permiten plantillas fuera de la ventana de 24h.',
            );
          } else {
            this._alerta.mensajeError(
              'Error al enviar',
              err?.error?.detail || err?.error?.mensaje || err?.message || 'Error desconocido',
            );
          }
          this._cdr.detectChanges();
        },
      });
  }

  /** Devuelve true si la ventana de 24h con el cliente esta vencida (basado en fecha_ventana_24h). */
  get ventana24hVencida(): boolean {
    const fecha = this.conversacionActiva?.fecha_ventana_24h;
    if (!fecha) return true;
    const ms24h = 24 * 60 * 60 * 1000;
    return Date.now() - new Date(fecha).getTime() > ms24h;
  }

  /** Horas desde el ultimo mensaje del cliente — util para mostrar advertencia. */
  get horasDesdeUltimoMensajeCliente(): number | null {
    const fecha = this.conversacionActiva?.fecha_ventana_24h;
    if (!fecha) return null;
    return Math.round((Date.now() - new Date(fecha).getTime()) / 3600000);
  }

  cerrar(): void {
    if (!this.conversacionActiva) return;
    this._api.cerrarConversacion(this.conversacionActiva.id).subscribe((c) => {
      this.conversacionActiva = c;
      this._cdr.detectChanges();
    });
  }

  reabrir(): void {
    if (!this.conversacionActiva) return;
    this._api.reabrirConversacion(this.conversacionActiva.id).subscribe((c) => {
      this.conversacionActiva = c;
      this._cdr.detectChanges();
    });
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  // ---- Nueva conversacion ----
  abrirNueva(): void {
    this.modalNuevaAbierto = true;
  }

  cerrarModalNueva(): void {
    this.modalNuevaAbierto = false;
  }

  onConversacionCreada(conversacionId: number): void {
    this.modalNuevaAbierto = false;
    // Refresca la lista de abiertas y selecciona la nueva. Si por algun motivo no
    // aparece (filtro distinto), pedimos el detalle y la insertamos arriba.
    this._api.listarConversaciones({ estado: 'abierta' }).subscribe({
      next: (resp) => {
        this.conversaciones = resp.results;
        const conv = resp.results.find((c) => c.id === conversacionId);
        if (conv) {
          this.seleccionar(conv);
        } else {
          this._api.obtenerConversacion(conversacionId).subscribe((c) => {
            this.conversaciones = [c, ...this.conversaciones];
            this.seleccionar(c);
            this._cdr.detectChanges();
          });
        }
        this._cdr.detectChanges();
      },
    });
  }

  // ---- Helpers de presentación ----

  iniciales(conv: Conversacion): string {
    const nombre = (conv.cliente_nombre || '').trim();
    if (nombre) {
      const partes = nombre.split(/\s+/).filter(Boolean);
      if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
      return partes[0].substring(0, 2).toUpperCase();
    }
    const digs = conv.cliente_telefono.replace(/\D/g, '');
    return digs.slice(-2);
  }

  colorAvatar(telefono: string): { bg: string; text: string; ring: string } {
    let hash = 0;
    for (let i = 0; i < telefono.length; i++) hash = (hash * 31 + telefono.charCodeAt(i)) >>> 0;
    return this._coloresAvatar[hash % this._coloresAvatar.length];
  }

  etiquetaFecha(fecha: string | null): string {
    if (!fecha) return '';
    const f = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(f, hoy)) return 'Hoy';
    if (sameDay(f, ayer)) return 'Ayer';
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${f.getDate()} ${meses[f.getMonth()]}`;
  }

  mostrarSeparadorFecha(indice: number): boolean {
    if (indice === 0) return true;
    const actual = this.mensajes[indice]?.fecha;
    const previo = this.mensajes[indice - 1]?.fecha;
    if (!actual || !previo) return false;
    const a = new Date(actual);
    const b = new Date(previo);
    return a.toDateString() !== b.toDateString();
  }

  resumenUltimo(conv: Conversacion): string {
    // Solo un placeholder — el API actual no entrega preview por conversación.
    // Si después lo agregamos, cambiar acá.
    return conv.cliente_telefono;
  }
}
