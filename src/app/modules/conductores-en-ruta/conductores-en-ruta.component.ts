import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { interval, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FormatFechaPipe } from '../../common/pipes/formatear_fecha';
import { HttpService } from '../../common/services/http.service';
import { GeneralApiService } from '../../core';
import { obtenerContenedorSubdominio } from '../../redux/selectors/contenedor.selector';
import { TokenService } from '../auth/services/token.service';

interface ConductorEnRuta {
  conductor_id: number;
  conductor_nombre: string;
  telefono: string | null;
  ordenes: number;
  visitas: number;
  entregadas: number;
  consulta_pendiente: boolean;
  no_leidos: number;
  ultimo_mensaje: {
    comentario: string;
    fecha_registro: string;
    es_conductor: boolean;
  } | null;
}

interface MensajeSeguimiento {
  id: number;
  tipo: string;
  estado: string | null;
  comentario: string | null;
  opciones: string[] | null;
  opcion: string | null;
  es_conductor: boolean;
  fecha_registro: string;
  autor_nombre?: string;
}

@Component({
  selector: 'app-conductores-en-ruta',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatFechaPipe],
  templateUrl: './conductores-en-ruta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConductoresEnRutaComponent implements OnInit, OnDestroy {
  private _api = inject(GeneralApiService);
  private _http = inject(HttpService);
  private _destroy = inject(DestroyRef);
  private _store = inject(Store);
  private _token = inject(TokenService);

  conductores = signal<ConductorEnRuta[]>([]);
  seleccionado = signal<ConductorEnRuta | null>(null);
  conversacion = signal<MensajeSeguimiento[]>([]);
  cargandoLista = signal<boolean>(false);
  texto = '';

  private _ws?: WebSocket;
  private _wsRetry?: ReturnType<typeof setTimeout>;
  private _vivo = true;

  ngOnInit(): void {
    this.consultarLista();
    this.conectarWs();
    // Fallback si el WS se cae: poll lento.
    interval(30000)
      .pipe(takeUntilDestroyed(this._destroy))
      .subscribe(() => {
        this.consultarLista();
        const c = this.seleccionado();
        if (c) this.consultarConversacion(c.conductor_id);
      });
  }

  ngOnDestroy(): void {
    this._vivo = false;
    if (this._wsRetry) clearTimeout(this._wsRetry);
    this._ws?.close();
  }

  private conectarWs(): void {
    this._store
      .select(obtenerContenedorSubdominio)
      .pipe(take(1))
      .subscribe((schema) => {
        const token = this._token.obtener();
        if (!schema || !token) return;
        const base = environment.url_api_subdominio
          .replace('subdominio', schema)
          .replace(/^http/, 'ws');
        const url = `${base}/ws/seguimiento/?token=${token}&schema=${schema}&role=admin`;
        try {
          this._ws = new WebSocket(url);
          this._ws.onmessage = (e) => this._alRecibir(e);
          this._ws.onclose = () => {
            if (this._vivo) {
              this._wsRetry = setTimeout(() => this.conectarWs(), 5000);
            }
          };
        } catch {
          /* el poll de respaldo cubre la caída */
        }
      });
  }

  private _alRecibir(e: MessageEvent): void {
    this.consultarLista();
    const c = this.seleccionado();
    try {
      const data = JSON.parse(e.data);
      if (c && data?.conductor_id === c.conductor_id) {
        this.consultarConversacion(c.conductor_id);
      }
    } catch {
      if (c) this.consultarConversacion(c.conductor_id);
    }
  }

  consultarLista(): void {
    this.cargandoLista.set(true);
    this._api
      .consultaApi<ConductorEnRuta[]>('ruteo/seguimiento/conductores-en-ruta/')
      .subscribe({
        next: (r) => {
          this.conductores.set(r ?? []);
          this.cargandoLista.set(false);
        },
        error: () => this.cargandoLista.set(false),
      });
  }

  seleccionar(c: ConductorEnRuta): void {
    this.seleccionado.set(c);
    this.consultarConversacion(c.conductor_id);
    if (c.no_leidos > 0) {
      this._http
        .post('ruteo/seguimiento/marcar-leidos/', { conductor_id: c.conductor_id })
        .subscribe({ next: () => {}, error: () => {} });
    }
  }

  consultarConversacion(conductorId: number): void {
    this._api
      .consultaApi<MensajeSeguimiento[]>('ruteo/seguimiento/', {
        conductor_id: conductorId,
        lista_completa: 'true',
        ordering: 'fecha_registro',
      })
      .subscribe({
        next: (r) => this.conversacion.set(r ?? []),
        error: () => {},
      });
  }

  consultarEstado(c: ConductorEnRuta): void {
    this._http
      .post('ruteo/seguimiento/consultar/', { conductor_id: c.conductor_id })
      .subscribe({
        next: () => {
          this.consultarLista();
          this.consultarConversacion(c.conductor_id);
        },
        error: () => {},
      });
  }

  enviar(): void {
    const c = this.seleccionado();
    const t = this.texto.trim();
    if (!c || !t) return;
    this._http
      .post('ruteo/seguimiento/mensaje/', { conductor_id: c.conductor_id, texto: t })
      .subscribe({
        next: () => {
          this.texto = '';
          this.consultarConversacion(c.conductor_id);
        },
        error: () => {},
      });
  }

  llamar(telefono: string | null): void {
    if (telefono) window.open('tel:' + telefono, '_self');
  }
}
