import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { VisitaApiService } from '../../servicios/visita-api.service';
import VisitaFormularioComponent from '../visita-formulario/visita-formulario.component';

@Component({
  selector: 'app-visita-editar-rutear',
  standalone: true,
  imports: [VisitaFormularioComponent],
  templateUrl: './visita-editar-rutear.component.html',
  styleUrl: './visita-editar-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaEditarRutearComponent extends General {
  private readonly _visitaApiService = inject(VisitaApiService);

  @Input() visita: any;
  @Output() emitirCerrarModal = new EventEmitter<void>();

  enviar(formulario: any) {
    const payload = {
      ...formulario,
      id: this.visita?.id,
    };
    this._visitaApiService.actualizarDireccion(payload).subscribe(() => {
      this.alerta.mensajaExitoso('Se actualizó la visita');
      this.emitirCerrarModal.emit();
    });
  }
}
