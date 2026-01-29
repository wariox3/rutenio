import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { finalize } from 'rxjs/operators';
import { UtilidadApiService } from '../../servicios/utilidad-api.service';
import { AlertaService } from '../../../../common/services/alerta.service';
import { General } from '../../../../common/clases/general';
import { DecodificarDireccionResponse } from '../../interfaces/utilidad.interface';

@Component({
  selector: 'app-decodificar-direccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GoogleMapsModule],
  templateUrl: './decodificar-direccion.component.html',
  styleUrl: './decodificar-direccion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DecodificarDireccionComponent extends General {
  private readonly _utilidadApiService = inject(UtilidadApiService);
  private readonly _alertaService = inject(AlertaService);

  public estaCargando$ = signal<boolean>(false);
  public direccionControl = new FormControl('', [Validators.required]);
  public resultado$ = signal<DecodificarDireccionResponse | null>(null);

  // Propiedades del mapa
  public readonly mapCenter = computed<google.maps.LatLngLiteral>(() => {
    const datos = this.resultado$()?.datos;
    if (datos?.latitud && datos?.longitud) {
      return {
        lat: datos.latitud,
        lng: datos.longitud,
      };
    }
    return { lat: 6.200713725811437, lng: -75.58609508555918 };
  });

  public readonly mapZoom = 15;

  public readonly mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 8,
  };

  public readonly markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };

  buscar(): void {
    if (this.direccionControl.invalid) {
      this._alertaService.mensajeError('Error', 'Por favor ingrese una dirección');
      return;
    }

    this.estaCargando$.set(true);
    this.resultado$.set(null);

    const data = {
      direccion: this.direccionControl.value,
    };

    this._utilidadApiService
      .decodificarDireccion(data)
      .pipe(
        finalize(() => {
          this.estaCargando$.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          this.resultado$.set(res);
        },
        error: (error) => {
          this._alertaService.mensajeError(
            'Error',
            error?.error?.mensaje || 'Error al decodificar la dirección'
          );
        },
      });
  }

  limpiar(): void {
    this.direccionControl.reset();
    this.resultado$.set(null);
  }
}
