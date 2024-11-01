import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vehiculo-nuevo',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>vehiculo-nuevo works!</p>`,
  styleUrl: './vehiculo-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoNuevoComponent { }
