import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { DespachoService } from '../../servicios/despacho.service';
import { RouterLink } from '@angular/router';
import { Despacho } from '../../interfaces/despacho.interface';
import { DespachoTabVisitaComponent } from "../despacho-tab-visita/despacho-tab-visita.component";
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { DespachoTabUbicacionComponent } from "../despacho-tab-ubicacion/despacho-tab-ubicacion.component";

@Component({
  selector: 'app-despacho-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DespachoTabVisitaComponent,
    FormatFechaPipe,
    DespachoTabUbicacionComponent
],
  templateUrl: './despacho-detalle.component.html',
  styleUrl: './despacho-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoDetalleComponent extends General implements OnInit {
  private despachoService = inject(DespachoService)


  despachoId : number


  despacho = signal<Despacho>({
    id: 0,
    fecha: '',
    estado: '',
    peso: 0,
    volumen: 0,
    visitas: 0,
    visitas_entregadas: 0,
    visitas_entregadas_esperadas: 0,
    vehiculo_id: 0,
    vehiculo_placa: '',
    estado_aprobado: false,
    tiempo: 0,
    tiempo_trayecto: 0,
    tiempo_servicio: 0,
    fecha_salida: '' 
  })

  activeTab: string = 'visitas';

  ngOnInit(): void {
    this.obtenerParametroRuta();
    this.consultarDespacho();
  }

  consultarDespacho(){
    this.despachoService.consultarDetalle(this.despachoId).subscribe(respuesta => {
      this.despacho.set(respuesta)
    })
  }

  obtenerParametroRuta(){
    this.activatedRoute.params.subscribe(
      (params:any) => {this.despachoId = params.id}
    );
  }

 }
