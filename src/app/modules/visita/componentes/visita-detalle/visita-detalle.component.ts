import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { General } from '../../../../common/clases/general';
import { VisitaService } from '../../servicios/visita.service';
import { Visita } from '../../interfaces/visita.interface';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { ModalDefaultComponent } from "../../../../common/components/ui/modals/modal-default/modal-default.component";
import { BehaviorSubject } from 'rxjs';
import { ArchivosComponent } from "../../../../common/components/botonera-opciones/botonera-opciones.component";

@Component({
  selector: 'app-visita-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormatFechaPipe,
    ModalDefaultComponent,
    ArchivosComponent
],
  templateUrl: './visita-detalle.component.html',
  styleUrl: './visita-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaDetalleComponent extends General implements OnInit { 
  private visitaService = inject(VisitaService)

  public toggleModalArchivos$ = new BehaviorSubject(false);

  visitaId : number

    visita = signal<Visita>({
      id: 0,
      guia: 0,
      fecha: '',
      documento: '',
      destinatario: '',
      destinatario_direccion: '',
      ciudad_id: 0,
      destinatario_telefono: '',
      destinatario_correo: null,
      peso: 0,
      volumen: 0,
      estado_decodificado: false,
      latitud: 0,
      estado_entregado: false,
      longitud: 0,
      orden: 0,
      distancia_proxima: 0,
      franja_id: 0,
      franja_codigo: null,
      franja_nombre: '',
      numero: 0,
      tiempo: 0,
      tiempo_servicio: 0,
      tiempo_trayecto: 0,
      estado_decodificado_alerta: false,
      estado_despacho: false,
      destinatario_direccion_formato: '',
      resultados: []
    })

  ngOnInit(): void {
    this.obtenerParametroRuta();
    this.consultarVisita();
  }

  consultarVisita(){
    this.visitaService.consultarDetalle(this.visitaId).subscribe(respuesta => {
      this.visita.set(respuesta)
    })
  }

  obtenerParametroRuta(){
    this.activatedRoute.params.subscribe(
      (params:any) => {this.visitaId = params.id}
    );
  }
  
  abrirModalArchivos() {
    this.toggleModalArchivos$.next(true);
  }

  cerrarModalArchivos() {
    this.toggleModalArchivos$.next(false);
  }

}
