import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Visita } from '../../../../../../interfaces/visita/visita.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visita-rutear-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visita-rutear-detalle.component.html',
  styleUrl: './visita-rutear-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaRutearDetalleComponent {
  @Input({ required: true }) visita: Visita;
}
