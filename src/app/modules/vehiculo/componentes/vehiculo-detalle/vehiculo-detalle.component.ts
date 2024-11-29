import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VehiculoService } from '../../servicios/vehiculo.service';
import { switchMap, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';

@Component({
  selector: 'app-vehiculo-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './vehiculo-detalle.component.html',
  styleUrl: './vehiculo-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoDetalleComponent extends General implements OnInit { 
  private vehiculoService = inject(VehiculoService)

  vehiculo: any = {
    placa: '',
    capacidad: 0,
    franja_id: null,
    franja_codigo: '',
    franja_nombre: ''
  }

ngOnInit(): void {
  this.activatedRoute.params.pipe(
    switchMap((respuestaParametros: any)=> {
      return this.vehiculoService.consultarDetalle(respuestaParametros.id)
    }),
    tap((respuestaConsultaDetalle)=>{
      this.vehiculo = respuestaConsultaDetalle
      this.changeDetectorRef.detectChanges();
    })
  ).subscribe();
}

}
