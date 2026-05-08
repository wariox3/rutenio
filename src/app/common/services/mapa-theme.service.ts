import { DestroyRef, Injectable, Signal, computed, inject, signal } from '@angular/core';

/**
 * Provee styles de Google Maps que reaccionan al theme global (clase `.dark`
 * en el `<html>` aplicada por Metronic KTTheme).
 *
 * Uso en componente:
 *   private _mapaTheme = inject(MapaThemeService);
 *   public mapOptions = computed<google.maps.MapOptions>(() => ({
 *     ...this.opcionesBase,
 *     styles: this._mapaTheme.styles(),
 *   }));
 */
@Injectable({ providedIn: 'root' })
export class MapaThemeService {
  private readonly _esDark = signal<boolean>(this._detectarDark());
  private _observer?: MutationObserver;

  /** Reactivo: true si el `<html>` tiene la clase `dark`. */
  readonly esDark: Signal<boolean> = this._esDark.asReadonly();

  /** Reactivo: array de styles de Google Maps según theme actual. */
  readonly styles: Signal<google.maps.MapTypeStyle[]> = computed(() =>
    this._esDark() ? STYLES_DARK : STYLES_LIGHT
  );

  constructor() {
    // Observa cambios de la clase del <html> (cuando el usuario hace toggle).
    if (typeof document !== 'undefined') {
      this._observer = new MutationObserver(() => {
        const ahora = this._detectarDark();
        if (ahora !== this._esDark()) {
          this._esDark.set(ahora);
        }
      });
      this._observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    inject(DestroyRef).onDestroy(() => {
      this._observer?.disconnect();
    });
  }

  private _detectarDark(): boolean {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Helper para componentes que ya tienen `opciones` propias.
   * Devuelve las mismas opciones con `styles` actualizado al theme.
   */
  conTheme(opciones: google.maps.MapOptions = {}): google.maps.MapOptions {
    return { ...opciones, styles: this.styles() };
  }
}

/** Estilos light: usar default de Google Maps (sin overrides). */
const STYLES_LIGHT: google.maps.MapTypeStyle[] = [];

/** Estilos dark — preset basado en "Dark Mode Standard" de Google Maps. */
const STYLES_DARK: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1f2937' }] }, // gray-800 Tailwind
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] }, // gray-400
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] }, // gray-900
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#4b5563' }], // gray-600
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1d5db' }], // gray-300
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1a3a2a' }], // verde muy oscuro
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#374151' }], // gray-700
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#525252' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }], // slate-900 — agua casi negra
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }], // slate-600
  },
];
