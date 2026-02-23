import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MarcadorMapa } from '../../../../interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'app-dashboard-mapa',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './dashboard-mapa.component.html',
  styleUrl: './dashboard-mapa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMapaComponent implements OnChanges {
  @Input({ required: true }) marcadores!: MarcadorMapa[];

  centro: google.maps.LatLngLiteral = { lat: 4.6097, lng: -74.0817 };
  zoom = 12;

  opcionesMapa: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  };

  ngOnChanges(): void {
    this.centrarEnMarcadores();
  }

  private centrarEnMarcadores(): void {
    if (!this.marcadores || this.marcadores.length === 0) return;

    const lats = this.marcadores.map(m => m.lat);
    const lngs = this.marcadores.map(m => m.lng);

    this.centro = {
      lat: lats.reduce((a, b) => a + b, 0) / lats.length,
      lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
    };

    if (this.marcadores.length === 1) {
      this.zoom = 14;
    } else {
      const latDiff = Math.max(...lats) - Math.min(...lats);
      const lngDiff = Math.max(...lngs) - Math.min(...lngs);
      const maxDiff = Math.max(latDiff, lngDiff);

      if (maxDiff > 1) this.zoom = 8;
      else if (maxDiff > 0.5) this.zoom = 10;
      else if (maxDiff > 0.1) this.zoom = 12;
      else this.zoom = 14;
    }
  }

  obtenerIconoMarcador(tipo: 'entrega' | 'incidencia'): google.maps.Icon {
    const color = tipo === 'entrega' ? '#0098d7' : '#f1416c';
    return {
      url: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(30, 30),
    };
  }
}
