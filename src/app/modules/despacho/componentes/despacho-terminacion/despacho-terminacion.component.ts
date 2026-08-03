import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TerminacionPreview } from '../../../../interfaces/despacho/terminacion.interface';

@Component({
  selector: 'app-despacho-terminacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './despacho-terminacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTerminacionComponent {
  // Consolidado del viaje (vista previa). Presentacional: el padre orquesta el cierre.
  @Input({ required: true }) datos!: TerminacionPreview;
  @Input() cargando = false;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
