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
import { BehaviorSubject } from 'rxjs';
import { ModalDefaultComponent } from "../../../../common/components/ui/modals/modal-default/modal-default.component";
import { NovedadSolucionComponent } from "../novedad-solucion/novedad-solucion.component";
import { KTModal } from '../../../../../metronic/core';

@Component({
  selector: 'app-novedad-detalle',
  standalone: true,
  imports: [
    BotoneraOpcionesComponent,
    CommonModule,
    RouterLink,
    FormatFechaPipe,
    ValidarBooleanoPipe,
    ModalDefaultComponent,
    NovedadSolucionComponent
],
  templateUrl: './novedad-detalle.component.html',
  styleUrl: './novedad-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NovedadDetalleComponent extends General implements OnInit {
  private novedadService = inject(NovedadService);

  public toggleModal$ = new BehaviorSubject(false);

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
    this.consultarNovedad();
  }

  consultarNovedad() {
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

  abrirModal() {
    this.toggleModal$.next(true);
  }

  cerrarModal() {
    this.toggleModal$.next(false);
  }

  actualizarNovedad(){
    this.modalDismiss();
    this.consultarNovedad();
  }

  modalDismiss() {
    const modalEl: HTMLElement = document.querySelector('#solucion-novedad-modal');
    const modal = KTModal.getInstance(modalEl);

    modal.toggle();
  }

}
