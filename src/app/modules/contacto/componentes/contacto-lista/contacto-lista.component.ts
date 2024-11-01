import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contacto-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>contacto-lista works!</p>`,
  styleUrl: './contacto-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoListaComponent { }
