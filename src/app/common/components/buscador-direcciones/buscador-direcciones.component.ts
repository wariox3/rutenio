import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { General } from '../../clases/general';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { ConfiguracionApiService } from '../../../modules/configuracion/servicios/configuracion-api.service';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { LabelComponent } from "../ui/form/label/label.component";
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-buscador-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormsModule, LabelComponent],
  templateUrl: './buscador-direcciones.component.html',
  styleUrl: './buscador-direcciones.component.css',
})
export default class BuscadorDireccionesComponent
  extends General
  implements OnInit, AfterViewInit
{
  @ViewChild('ngSelect') ngSelect!: NgSelectComponent;
  @Output() addressSelected = new EventEmitter<any>();
  @Input() direccionSeleccionada: string = '';

  private _configuracionService = inject(ConfiguracionApiService);
  private _alertaService = inject(AlertaService);

  searchInput$ = new Subject<string>();
  loading = signal(false);
  predictions = signal<any[]>([]);
  public selectedAddressModel: { description: string } | undefined;

  ngOnInit(): void {
    this.setupAddressSearch();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.ngSelect.focus();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['direccionSeleccionada']) {
      const currentValue = changes['direccionSeleccionada'].currentValue as string | undefined;
      if (currentValue && currentValue.trim() !== '') {
        this.selectedAddressModel = { description: currentValue };
        this.searchInput$.next(currentValue);
      } else {
        this.selectedAddressModel = undefined;
        this.predictions.set([]);
        this.searchInput$.next('');
      }
    }
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

  selectAddress(selectedItem: any): void {
    if (selectedItem && selectedItem.place_id) {
      this.predictions.set([]);
      this.getPlaceDetails(selectedItem.place_id);
    } else if (!selectedItem) {
      this.addressSelected.emit(null);
      this.predictions.set([]);
    }
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
        // El backend traduce el status de Google (ZERO_RESULTS, OVER_QUERY_LIMIT,
        // REQUEST_DENIED, INVALID_REQUEST, UNKNOWN_ERROR) a error.mensaje.
        console.error('Error al obtener detalles:', error);
        const mensaje =
          error?.error?.mensaje ||
          'No se pudo obtener la información de la dirección. Intenta de nuevo.';
        this._alertaService.mensajeError('Dirección no disponible', mensaje);
        this.selectedAddressModel = undefined;
        this.addressSelected.emit(null);
      },
    });
  }

  focusInput(): void {
    this.ngSelect.focus();
  }
}
