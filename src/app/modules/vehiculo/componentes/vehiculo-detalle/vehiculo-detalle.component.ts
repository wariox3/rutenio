import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VehiculoService } from '../../servicios/vehiculo.service';
import { switchMap, tap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ListaVehiculo } from '../../../../interfaces/vehiculo/vehiculo.interface';

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

  vehiculo = signal<ListaVehiculo | null>(null)

ngOnInit(): void {
  this.activatedRoute.params.pipe(
    switchMap((respuestaParametros: any)=> {
      return this.vehiculoService.consultarDetalle(respuestaParametros.id)
    }),
    tap((respuestaConsultaDetalle)=>{
      this.vehiculo.set(respuestaConsultaDetalle)
    })
  ).subscribe();
}

}
