import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { Subject } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { GeneralApiService } from '../../../../core';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { Ubicacion } from '../../../../interfaces/ubicacion/ubicacion.interface';
import { MapaThemeService } from '../../../../common/services/mapa-theme.service';

interface MarcadorUbicacion {
  position: google.maps.LatLngLiteral;
  label: string;
  icon: google.maps.Icon;
  ubicacionId: number;
}

@Component({
  selector: 'app-despacho-tab-ubicacion',
  standalone: true,
  imports: [CommonModule, FormatFechaPipe, GoogleMapsModule],
  templateUrl: './despacho-tab-ubicacion.component.html',
  styleUrl: './despacho-tab-ubicacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTabUbicacionComponent
  extends General
  implements OnInit, OnDestroy
{
  @Input() despachoId: number;
  @ViewChild(GoogleMap) map?: GoogleMap;

  private _destroy$ = new Subject<void>();
  private _generalApiService = inject(GeneralApiService);
  protected mapaTheme = inject(MapaThemeService);

  // Lista cronológica ascendente (más viejo arriba) para el timeline.
  ubicaciones = signal<Ubicacion[]>([]);
  cargando = signal<boolean>(false);
  puntoSeleccionadoId = signal<number | null>(null);

  // Configuración de mapa.
  center: google.maps.LatLngLiteral = { lat: 4.6097, lng: -74.0817 };
  zoom = 11;
  polylinePath = signal<google.maps.LatLngLiteral[]>([]);
  marcadores = signal<MarcadorUbicacion[]>([]);

  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#3b82f6',
    strokeOpacity: 0.85,
    strokeWeight: 4,
  };

  // Métricas derivadas para el strip superior.
  puntosTotales = computed(() => this.ubicaciones().length);
  paradasTotales = computed(
    () => this.ubicaciones().filter((u) => u.detenido).length
  );
  ultimaFecha = computed(() => {
    const lista = this.ubicaciones();
    return lista.length > 0 ? lista[lista.length - 1].fecha : null;
  });
  primeraFecha = computed(() => {
    const lista = this.ubicaciones();
    return lista.length > 0 ? lista[0].fecha : null;
  });
  conductorId = computed(() => {
    const lista = this.ubicaciones();
    return lista.length > 0 ? lista[0].usuario_id : null;
  });

  ngOnInit(): void {
    this.consultarUbicaciones();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  consultarUbicaciones(): void {
    if (!this.despachoId) return;
    this.cargando.set(true);

    const parametros: ParametrosApi = {
      limit: 500,
      ordering: 'fecha',
      serializador: 'trafico',
      despacho_id: this.despachoId.toString(),
    };

    this._generalApiService
      .consultaApi<RespuestaApi<Ubicacion>>('ruteo/ubicacion/', parametros)
      .subscribe({
        next: (respuesta) => {
          this.ubicaciones.set(respuesta.results);
          this._construirMapa(respuesta.results);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }

  private _construirMapa(lista: Ubicacion[]): void {
    if (lista.length === 0) {
      this.polylinePath.set([]);
      this.marcadores.set([]);
      return;
    }

    const puntos: google.maps.LatLngLiteral[] = lista.map((u) => ({
      lat: Number(u.latitud),
      lng: Number(u.longitud),
    }));
    this.polylinePath.set(puntos);

    // Marcadores: inicio (verde), fin (rojo), y muestreo intermedio cada N
    // puntos para no saturar el mapa (cap ~12 markers totales).
    const total = lista.length;
    const intervalo = Math.max(1, Math.floor(total / 10));
    const nuevos: MarcadorUbicacion[] = [];

    lista.forEach((u, i) => {
      const esInicio = i === 0;
      const esFin = i === total - 1;
      const esIntervalo = i % intervalo === 0;
      if (!(esInicio || esFin || esIntervalo)) return;

      const url = esInicio
        ? 'assets/images/marker-verde.svg'
        : esFin
        ? 'assets/images/marker-rojo.svg'
        : 'assets/images/marker-azul.svg';

      const grande = esInicio || esFin;
      nuevos.push({
        position: puntos[i],
        label: (i + 1).toString(),
        ubicacionId: u.id,
        icon: {
          url,
          scaledSize: new google.maps.Size(
            grande ? 28 : 22,
            grande ? 40 : 32
          ),
          anchor: new google.maps.Point(
            grande ? 14 : 11,
            grande ? 40 : 32
          ),
          labelOrigin: new google.maps.Point(
            grande ? 14 : 11,
            grande ? 15 : 12
          ),
        },
      });
    });
    this.marcadores.set(nuevos);

    // Centrar en el último punto y ajustar bounds cuando el mapa esté listo.
    this.center = puntos[puntos.length - 1];
    setTimeout(() => this._fitBoundsAlMapa(puntos), 0);
  }

  private _fitBoundsAlMapa(puntos: google.maps.LatLngLiteral[]): void {
    if (!this.map || puntos.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    puntos.forEach((p) => bounds.extend(p));
    this.map.fitBounds(bounds, 40);
  }

  onMapReady(): void {
    const puntos = this.polylinePath();
    if (puntos.length > 0) this._fitBoundsAlMapa(puntos);
  }

  // Hace foco en un punto desde el timeline → centra el mapa.
  enfocarPunto(ubicacion: Ubicacion): void {
    this.puntoSeleccionadoId.set(ubicacion.id);
    const pos: google.maps.LatLngLiteral = {
      lat: Number(ubicacion.latitud),
      lng: Number(ubicacion.longitud),
    };
    this.center = pos;
    if (this.map) {
      this.map.panTo(pos);
      const zoomActual = this.map.getZoom() ?? this.zoom;
      if (zoomActual < 15) this.map.zoom = 15;
    }
  }
}
