import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SwitchComponent } from '../../../../common/components/ui/form/switch/switch.component';
import { GeneralApiService } from '../../../../core';
import { General } from '../../../../common/clases/general';
import BuscadorDireccionesComponent from '../../../../common/components/buscador-direcciones/buscador-direcciones.component';
import { CommonModule, Location } from '@angular/common';
import { map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CargarImagenComponent } from '../../../../common/components/cargar-imagen/cargar-imagen.component';
import {
  empresaActualizacionImangenAction,
} from '../../../../redux/actions/empresa/empresa.actions';
import {
  configuracionActualizacionAction,
} from '../../../../redux/actions/configuracion/configuracion.actions';
import {
  obtenerEmpresaId,
  obtenerEmpresaImagen,
} from '../../../../redux/selectors/empresa.selectors';
import {
  obtenerConfiguracionInformacion,
} from '../../../../redux/selectors/configuracion.selectors';
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
export default class ConfiguracionComponent extends General implements OnDestroy {
  private _generalApiService = inject(GeneralApiService);
  private _location = inject(Location);
  private _empresaServices = inject(EmpresaService);
  private alertaService = inject(AlertaService);
  private destroy$ = new Subject<void>();
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
    this.store
      .select(obtenerConfiguracionInformacion)
      .pipe(
        takeUntil(this.destroy$),
        tap((configuracion) => {
          if (configuracion.id > 0) {
            this.formularioConfiguracion.patchValue({
              id: configuracion.id,
              empresa: configuracion.empresa,
              rut_sincronizar_complemento: configuracion.rut_sincronizar_complemento,
              rut_rutear_franja: configuracion.rut_rutear_franja,
              rut_direccion_origen: configuracion.rut_direccion_origen,
              rut_latitud: configuracion.rut_latitud,
              rut_longitud: configuracion.rut_longitud,
            });
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit() {
    this._generalApiService
      .guardarConfiguracion(this.formularioConfiguracion.value, 1)
      .pipe(
        tap((response) => {
          this.store.dispatch(
            configuracionActualizacionAction({ configuracion: response })
          );
          this.alerta.mensajaExitoso('Configuración guardada correctamente');
        })
      )
      .subscribe();
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
