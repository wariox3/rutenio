import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { General } from '../../../../common/clases/general';
import { BotoneraOpcionesComponent } from '../../../../common/components/botonera-opciones/botonera-opciones.component';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { NovedadTabComponent } from "../../../novedad/componentes/novedad-tab/novedad-tab.component";
import { Visita } from '../../interfaces/visita.interface';
import { VisitaApiService } from '../../servicios/visita-api.service';

@Component({
  selector: 'app-visita-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormatFechaPipe,
    BotoneraOpcionesComponent,
    NovedadTabComponent
],
  templateUrl: './visita-detalle.component.html',
  styleUrl: './visita-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaDetalleComponent extends General implements OnInit {
  private _visitaApiService = inject(VisitaApiService);

  visitaId: number;

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
    estado_novedad: false,
    destinatario_direccion_formato: '',
    resultados: [],
  });

  activeTab: string = 'novedades';

  ngOnInit(): void {
    this.obtenerParametroRuta();
    this.consultarVisita();
  }

  consultarVisita() {
    this._visitaApiService
      .getDetalle(this.visitaId)
      .subscribe((respuesta) => {
        this.visita.set(respuesta);
      });
  }

  obtenerParametroRuta() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.visitaId = params.id;
    });
  }

}
