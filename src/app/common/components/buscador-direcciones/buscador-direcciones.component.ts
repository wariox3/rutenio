import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { General } from '../../clases/general';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfiguracionApiService } from '../../../modules/configuracion/servicios/configuracion-api.service';

@Component({
  selector: 'app-buscador-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscador-direcciones.component.html',
  styleUrl: './buscador-direcciones.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BuscadorDireccionesComponent
  extends General
  implements OnInit
{
  @ViewChild('addressInput') addressInput!: ElementRef;
  @Output() addressSelected = new EventEmitter<any>();

  private _configuracionService = inject(ConfiguracionApiService);

  addressControl = new FormControl();
  loading = false;
  predictions: any[] = [];

  ngOnInit(): void {
    this.setupAddressSearch();
  }

  private setupAddressSearch(): void {
    this.addressControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        if (value && value.length > 2) {
          this.searchAddress(value);
        } else {
          this.predictions = [];
        }
      });
  }

  searchAddress(input: string): void {
    this.loading = true;
    this.predictions = [];

    const params = {
      input: input,
      country: 'CO',
    };

    this._configuracionService.autocompletar(params).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.predictions) {
          this.predictions = response.predictions;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al buscar direcciones:', error);
      },
    });
  }

  selectAddress(prediction: any): void {
    this.addressControl.setValue(prediction.description);
    this.predictions = [];
    this.getPlaceDetails(prediction.place_id);
  }

  getPlaceDetails(placeId: string): void {
    if (!placeId) return;
    this.loading = true;
    this._configuracionService.detalle({ place_id: placeId }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.data) {
          this.addressSelected.emit({
            address: response.data.address || this.addressControl.value,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            placeId: placeId,
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al obtener detalles:', error);
      },
    });
  }

  onEnterPressed(): void {
    if (this.predictions.length > 0) {
      this.selectAddress(this.predictions[0]);
    }
  }

  clearSearch(): void {
    this.addressControl.setValue('');
    this.predictions = [];
    this.addressInput.nativeElement.focus();
  }

  focusInput(): void {
    this.addressInput.nativeElement.focus();
  }
}
