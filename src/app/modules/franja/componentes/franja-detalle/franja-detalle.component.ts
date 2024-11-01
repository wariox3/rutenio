import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-franja-detalle',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>franja-detalle works!</p>`,
  styleUrl: './franja-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaDetalleComponent { }
