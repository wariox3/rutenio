import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contacto-formulario',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>contacto-formulario works!</p>`,
  styleUrl: './contacto-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoFormularioComponent { }
