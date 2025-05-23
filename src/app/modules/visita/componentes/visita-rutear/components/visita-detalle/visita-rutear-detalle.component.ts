import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { General } from '../../../../../../common/clases/general';
import { ParametrosDireccionAlternativa } from '../../../../../../interfaces/visita/rutear.interface';
import { Visita } from '../../../../../../interfaces/visita/visita.interface';
import { VisitaApiService } from '../../../../servicios/visita-api.service';

@Component({
  selector: 'app-visita-rutear-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visita-rutear-detalle.component.html',
  styleUrl: './visita-rutear-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaRutearDetalleComponent extends General {
  @Input() mostarConfiguracionAdicional: boolean = false;
  @Input({ required: true }) visita: Visita;
  @Output() emitirRecargarLista: EventEmitter<void>;

  private readonly _visitaApiService = inject(VisitaApiService);

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

    this._visitaApiService
      .seleccionarDireccionAlternativa(parametros)
      .subscribe((respuesta) => {
        this.alerta.mensajaExitoso(respuesta.mensaje);
        this.emitirRecargarLista.emit();
      });
  }
}
