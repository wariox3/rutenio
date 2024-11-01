import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vehiculo-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>vehiculo-lista works!</p>`,
  styleUrl: './vehiculo-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoListaComponent { }
