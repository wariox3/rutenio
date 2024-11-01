import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contacto-detalle',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>contacto-detalle works!</p>`,
  styleUrl: './contacto-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoDetalleComponent { }
