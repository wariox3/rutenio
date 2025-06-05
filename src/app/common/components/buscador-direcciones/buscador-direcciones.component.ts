import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { General } from '../../clases/general';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { ConfiguracionApiService } from '../../../modules/configuracion/servicios/configuracion-api.service';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-buscador-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './buscador-direcciones.component.html',
  styleUrl: './buscador-direcciones.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BuscadorDireccionesComponent
  extends General
  implements OnInit, AfterViewInit
{
  @ViewChild('ngSelect') ngSelect!: NgSelectComponent;
  @Output() addressSelected = new EventEmitter<any>();

  private _configuracionService = inject(ConfiguracionApiService);

  searchInput$ = new Subject<string>();
  loading = signal(false);
  predictions = signal<any[]>([]);

  ngOnInit(): void {
    this.setupAddressSearch();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.ngSelect.focus();
    });
  }


  private setupAddressSearch(): void {
    this.searchInput$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value) => {
        if (value && value.length > 2) {
          this.searchAddress(value);
        } else {
          this.predictions.set([]);
        }
      });
  }

  searchAddress(input: string): void {
    this.loading.set(true);  
    this.predictions.set([]);

    const params = {
      input: input,
      country: 'CO',
    };

    this._configuracionService.autocompletar(params)
    .pipe(
      finalize(() => {
        this.loading.set(false);
      })
    )
    .subscribe({
      next: (response: any) => {
        if (response.predictions) {
          this.predictions.set(response.predictions);
        }
      },
      error: (error) => {
        console.error('Error al buscar direcciones:', error);
      },
    });
  }

  selectAddress(prediction: any): void {
    this.searchInput$.next(prediction.description);
    this.predictions.set([]);
    this.getPlaceDetails(prediction.place_id);
  }

  getPlaceDetails(placeId: string): void {
    if (!placeId) return;
    this.loading.set(true);
    this._configuracionService.detalle({ place_id: placeId })
    .pipe(
      finalize(() => {
        this.loading.set(false);
      })
    )
    .subscribe({
      next: (response: any) => {
        if (response.data) {
          this.addressSelected.emit({
            address: response.data.address,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            placeId: placeId,
          });
        }
      },
      error: (error) => {
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
    this.searchInput$.next('');
    this.predictions.set([]);
    this.ngSelect.focus();
  }

  focusInput(): void {
    this.ngSelect.focus();
  }
}
