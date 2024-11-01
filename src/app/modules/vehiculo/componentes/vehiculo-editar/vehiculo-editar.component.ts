import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vehiculo-editar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>vehiculo-editar works!</p>`,
  styleUrl: './vehiculo-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoEditarComponent { }
