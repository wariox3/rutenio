import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { GeneralApiService } from '../../../../core';
import { General } from '../../../../common/clases/general';
import BuscadorDireccionesComponent from '../../../../common/components/buscador-direcciones/buscador-direcciones.component';
import { CommonModule, Location } from '@angular/common';
import { map, of, switchMap, tap } from 'rxjs';
import { CargarImagenComponent } from '../../../../common/components/cargar-imagen/cargar-imagen.component';
import {
  empresaActualizacionImangenAction,
} from '../../../../redux/actions/empresa/empresa.actions';
import {
  obtenerEmpresaId,
  obtenerEmpresaImagen,
} from '../../../../redux/selectors/empresa.selectors';
import { EmpresaService } from '../../../empresa/servicios/empresa.service';
import { AlertaService } from '../../../../common/services/alerta.service';
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    SwitchComponent,
    ReactiveFormsModule,
    BuscadorDireccionesComponent,
    CommonModule,
    CargarImagenComponent,
  ],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export default class ConfiguracionComponent extends General {
  private _generalApiService = inject(GeneralApiService);
  private _location = inject(Location);
  private _empresaServices = inject(EmpresaService);
  private alertaService = inject(AlertaService);
  obtenerEmpresaImagen$ = this.store.select(obtenerEmpresaImagen);

  formularioConfiguracion = new FormGroup({
    id: new FormControl(0),
    empresa: new FormControl(0),
    rut_sincronizar_complemento: new FormControl(true),
    rut_rutear_franja: new FormControl(false),
    rut_direccion_origen: new FormControl(''),
    rut_latitud: new FormControl(''),
    rut_longitud: new FormControl(''),
  });

  goBack(): void {
    this._location.back();
  }

  getUserImageUrl() {
    return this.obtenerEmpresaImagen$?.pipe(
      map((imagenEmpresa) => {
        if (!imagenEmpresa) return '';

        if (imagenEmpresa.includes('imagen')) {
          return imagenEmpresa;
        } else {
          return `${imagenEmpresa}?${new Date().getTime()}`;
        }
      })
    );
  }

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
          rut_longitud: response.rut_longitud,
        });
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
      rut_longitud: addressData.longitude,
    });
  }

  recuperarBase64(event: any) {
    this._empresaServices.cargarLogo(1, event).subscribe({
      next: (respuesta) => {
        if (respuesta.cargar) {
          this.alertaService.mensajaExitoso('Logo cargado con exito');
          this.store.dispatch(
            empresaActualizacionImangenAction({
              imagen: respuesta.imagen,
            })
          );
          this.changeDetectorRef.detectChanges();
        }
      },
    });
  }

  eliminarLogo(event: boolean) {
    this._empresaServices
      .eliminarLogoEmpresa(1)
      .pipe(
        switchMap((respuestaEliminarLogoEmpresa) => {
          if (respuestaEliminarLogoEmpresa.limpiar) {
            this.store.dispatch(
              empresaActualizacionImangenAction({
                imagen: respuestaEliminarLogoEmpresa.imagen,
              })
            );
          }
          return of(null);
        })
      )
      .subscribe();
  }
}
