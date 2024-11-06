import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { VehiculoService } from '../../servicios/vehiculo.service';
import { switchMap, tap } from 'rxjs';
import VisitaFormularioComponent from "../../../visita/componentes/visita-formulario/visita-formulario.component";
import VehiculoFormularioComponent from "../vehiculo-formulario/vehiculo-formulario.component";

@Component({
  selector: 'app-vehiculo-editar',
  standalone: true,
  imports: [
    CommonModule,
    VisitaFormularioComponent,
    VehiculoFormularioComponent
],
  templateUrl: './vehiculo-editar.component.html',
  styleUrl: './vehiculo-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoEditarComponent extends General implements OnInit { 

  private vehiculoService = inject(VehiculoService);

  informacionVehiculo: any = {

  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap((respuestaParametros: any)=> {
        return this.vehiculoService.consultarDetalle(respuestaParametros.id)
      }),
      tap((respuestaConsultaDetalle)=>{
        this.informacionVehiculo = respuestaConsultaDetalle
        this.changeDetectorRef.detectChanges();
      })
    ).subscribe();
  }

  enviarFormulario(formulario: any) {
    this.vehiculoService.actualizarDatosVehiculo(this.informacionVehiculo.id, formulario).subscribe((respuesta: any) => {
      this.alerta.mensajaExitoso('Se ha actualizado el vehículo exitosamente.')
      this.router.navigate(['/administracion/vehiculo/detalle', respuesta.id]);
    });
  }

}
