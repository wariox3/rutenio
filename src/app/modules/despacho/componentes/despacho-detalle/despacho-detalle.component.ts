import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import {
  DespachoDetalle,
  despachoDetalleEmpty,
} from '../../../../interfaces/despacho/despacho.interface';
import { VisitaLiberarComponent } from '../../../visita/componentes/visita-liberar/visita-liberar.component';
import { DespachoService } from '../../servicios/despacho.service';
import { DespachoTabUbicacionComponent } from '../despacho-tab-ubicacion/despacho-tab-ubicacion.component';
import { DespachoTabVisitaComponent } from '../despacho-tab-visita/despacho-tab-visita.component';

@Component({
  selector: 'app-despacho-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DespachoTabVisitaComponent,
    FormatFechaPipe,
    DespachoTabUbicacionComponent,
    ModalDefaultComponent,
    VisitaLiberarComponent,
  ],
  templateUrl: './despacho-detalle.component.html',
  styleUrl: './despacho-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoDetalleComponent
  extends General
  implements OnInit
{
  private despachoService = inject(DespachoService);
  public toggleModal$ = new BehaviorSubject(false);

  despachoId: number;

  despacho = signal<DespachoDetalle>(despachoDetalleEmpty);

  activeTab: string = 'visitas';

  ngOnInit(): void {
    this.obtenerParametroRuta();
    this.consultarDespacho();
  }

  consultarDespacho() {
    this.despachoService
      .consultarDetalle(this.despachoId)
      .subscribe((respuesta) => {
        this.despacho.set(respuesta);
      });
  }

  obtenerParametroRuta() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.despachoId = params.id;
    });
  }

  abrirModal() {
    this.toggleModal$.next(true);
  }

  cerrarModal() {
    this.toggleModal$.next(false);
  }
}
