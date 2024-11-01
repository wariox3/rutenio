import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vehiculo-detalle',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>vehiculo-detalle works!</p>`,
  styleUrl: './vehiculo-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoDetalleComponent { }
