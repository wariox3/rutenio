import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { Visita } from '../../../../../../interfaces/visita/visita.interface';
import { CommonModule } from '@angular/common';
import { VisitaRutearService } from '../../../../servicios/visita-rutear.service';
import { ParametrosDireccionAlternativa } from '../../../../../../interfaces/visita/rutear.interface';
import { General } from '../../../../../../common/clases/general';
import { KTModal } from '../../../../../../../metronic/core';

@Component({
  selector: 'app-visita-rutear-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visita-rutear-detalle.component.html',
  styleUrl: './visita-rutear-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaRutearDetalleComponent extends General {
  @Input({ required: true }) visita: Visita;
  @Output() emitirRecargarLista: EventEmitter<void>;

  private readonly _visitaRutearService = inject(VisitaRutearService);

  constructor() {
    super();
    this.emitirRecargarLista = new EventEmitter();
  }

  seleccionarDireccionAlternativa(direccionAlternativa: any) {
    const parametros: ParametrosDireccionAlternativa = {
      id: this.visita.id,
      latitud: direccionAlternativa.geometry.location.lat,
      longitud: direccionAlternativa.geometry.location.lng,
      destinatario_direccion_formato: direccionAlternativa.formatted_address,
    };

    this._visitaRutearService
      .seleccionarDireccionAlternativa(parametros)
      .subscribe((respuesta) => {
        this.alerta.mensajaExitoso(respuesta.mensaje);
        this.emitirRecargarLista.emit()
      });
  }
}
