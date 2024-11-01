import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visita-detalle',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>visita-detalle works!</p>`,
  styleUrl: './visita-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaDetalleComponent { }
