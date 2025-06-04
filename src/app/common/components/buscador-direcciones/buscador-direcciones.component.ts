import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { General } from '../../clases/general';

@Component({
  selector: 'app-buscador-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscador-direcciones.component.html',
  styleUrl: './buscador-direcciones.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BuscadorDireccionesComponent extends General implements OnInit {

  @ViewChild('addressInput') addressInput!: ElementRef;
  @Output() addressSelected = new EventEmitter<any>();
  
  addressControl = new FormControl();
  loading = false;
  predictions: any[] = [];
  
  ngOnInit() {
    this.initAutocomplete();
  }

  initAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      {
        types: ['address'],
        componentRestrictions: { country: 'cl' } // Cambia según tu país
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.log("No details available for input: '" + place.name + "'");
        return;
      }
      
      const addressData = {
        address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      };
      
      this.addressSelected.emit(addressData);
    });
  }

  // Opcional: Si quieres buscar mientras se escribe
  onAddressChange() {
    if (this.addressControl.value && this.addressControl.value.length > 3) {
      // this.loading = true;
      
      // // Puedes llamar a tu backend Django que a su vez llame a Google Places API
      // this.http.get('tu-backend-django/api/address-autocomplete/', {
      //   params: { input: this.addressControl.value }
      // }).subscribe(
      //   (response: any) => {
      //     this.predictions = response.predictions;
      //     this.loading = false;
      //   },
      //   error => {
      //     console.error(error);
      //     this.loading = false;
      //   }
      // );
    }
  }

    selectPrediction(prediction: any) {
    // Implementa la lógica para manejar la selección de una predicción
    // Esto es necesario porque lo usas en el template
    console.log('Predicción seleccionada:', prediction);
    // Aquí podrías emitir el evento o hacer algo con la predicción seleccionada
  }

 }
