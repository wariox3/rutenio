import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-despacho-detalle',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>despacho-detalle works!</p>`,
  styleUrl: './despacho-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoDetalleComponent { }
