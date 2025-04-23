import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { Novedad } from '../../interfaces/novedad.interface';
import { NovedadService } from '../../servicios/novedad.service';
import { BotoneraOpcionesComponent } from '../../../../common/components/botonera-opciones/botonera-opciones.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { ValidarBooleanoPipe } from '../../../../common/pipes/validar_booleano';

@Component({
  selector: 'app-novedad-detalle',
  standalone: true,
  imports: [
    BotoneraOpcionesComponent,
    CommonModule,
    RouterLink,
    FormatFechaPipe,
    ValidarBooleanoPipe
  ],
  templateUrl: './novedad-detalle.component.html',
  styleUrl: './novedad-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NovedadDetalleComponent extends General implements OnInit {
  private novedadService = inject(NovedadService);

  novedadId: number;

  novedad = signal<Novedad>({
    id: 0,
    fecha: '',
    novedad_tipo_nombre: '',
    descripcion: '',
    estado_solucion: false,
    fecha_solucion: '',
    solucion: '',
  });

  ngOnInit(): void {
    this.obtenerParametroRuta();
    this.consultarVisita();
  }

  consultarVisita() {
    this.novedadService
      .consultarDetalle(this.novedadId)
      .subscribe((respuesta) => {
        this.novedad.set(respuesta);
      });
  }

  obtenerParametroRuta() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.novedadId = params.id;
    });
  }
}
