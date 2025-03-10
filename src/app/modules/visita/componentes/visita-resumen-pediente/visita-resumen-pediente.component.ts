import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { CommonModule } from '@angular/common';
import { RedondearPipe } from '../../../../common/pipes/redondear.pipe';

@Component({
  selector: 'app-visita-resumen-pediente',
  standalone: true,
  imports: [CommonModule, RedondearPipe],
  templateUrl: './visita-resumen-pendiente.component.html',
  styleUrl: './visita-resumen-pediente.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaResumenPedienteComponent extends General {
  @Input({ required: true }) resumen: any;
}
