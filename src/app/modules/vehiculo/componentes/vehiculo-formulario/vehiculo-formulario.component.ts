import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vehiculo-formulario',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>vehiculo-formulario works!</p>`,
  styleUrl: './vehiculo-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VehiculoFormularioComponent { }
