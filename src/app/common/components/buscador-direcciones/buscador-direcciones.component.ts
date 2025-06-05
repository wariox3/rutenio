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
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'; // Added FormsModule for ngModel
import { General } from '../../clases/general';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { ConfiguracionApiService } from '../../../modules/configuracion/servicios/configuracion-api.service';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-buscador-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormsModule], // Added FormsModule
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

  searchInput$ = new Subject<string>();
  loading = signal(false);
  predictions = signal<any[]>([]);
  public selectedAddressModel: { description: string } | undefined; // Property for ngModel

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
        // Trigger search for the default value to populate predictions and potentially fetch details if needed upon initial load.
        // This assumes that if a default value is provided, we want to treat it as if the user typed it.
        this.searchInput$.next(currentValue);
      } else {
        this.selectedAddressModel = undefined;
        this.predictions.set([]); // Clear any existing predictions
        this.searchInput$.next(''); // Ensure search state is also cleared
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

  selectAddress(selectedItem: any): void { // selectedItem is the item object from ng-select when using ngModel
    // selectedAddressModel is already updated by the ngModel binding.
    if (selectedItem && selectedItem.place_id) {
      // The input field of ng-select is already updated with selectedItem.description due to bindLabel and ngModel.
      // this.searchInput$.next(selectedItem.description); // This might be redundant or cause a double search.
      this.predictions.set([]); // Clear dropdown after selection
      this.getPlaceDetails(selectedItem.place_id);
    } else if (!selectedItem) {
      // This case handles when the selection is cleared (e.g., user presses backspace or clear button in ng-select)
      this.addressSelected.emit(null); // Notify parent component that selection is cleared
      this.predictions.set([]);
      // this.searchInput$.next(''); // ng-select input field should be clear, model is undefined.
    }
    // If selectedItem is the initial default object (e.g., { description: 'Default Address' }) without a place_id,
    // getPlaceDetails won't be called, which is correct. Details are fetched upon explicit selection from search results.
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

  focusInput(): void {
    this.ngSelect.focus();
  }
}
