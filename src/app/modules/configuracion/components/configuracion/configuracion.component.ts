import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { GeneralApiService } from '../../../../core';
import { General } from '../../../../common/clases/general';
import BuscadorDireccionesComponent from "../../../../common/components/buscador-direcciones/buscador-direcciones.component";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [SwitchComponent, ReactiveFormsModule, BuscadorDireccionesComponent, CommonModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export default class ConfiguracionComponent extends General {
  private _generalApiService = inject(GeneralApiService);

  formularioConfiguracion = new FormGroup({
    id: new FormControl(0),
    empresa: new FormControl(0),
    rut_sincronizar_complemento: new FormControl(true),
    rut_rutear_franja: new FormControl(false),
    rut_direccion_origen : new FormControl(''),
    rut_latitud : new FormControl(''),
    rut_longitud : new FormControl('')
  });

  ngOnInit(): void {
    this._generalApiService.getConfiguracion(1).subscribe({
      next: (response) => {
        this.formularioConfiguracion.patchValue({
          id: response.id,
          empresa: response.empresa,
          rut_sincronizar_complemento: response.rut_sincronizar_complemento,
          rut_rutear_franja: response.rut_rutear_franja,
          rut_direccion_origen: response.rut_direccion_origen,
          rut_latitud: response.rut_latitud,
          rut_longitud: response.rut_longitud
        })
      },
    });
  }

  submit() {
    this._generalApiService
      .guardarConfiguracion(this.formularioConfiguracion.value, 1)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.alerta.mensajaExitoso('Configuración guardada correctamente');
        },
      });
  }

  onAddressSelected(addressData: any) {
  this.formularioConfiguracion.patchValue({
    rut_direccion_origen: addressData.address,
    rut_latitud: addressData.latitude,
    rut_longitud: addressData.longitude
  });
}
}
