import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contacto-nuevo',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>contacto-nuevo works!</p>`,
  styleUrl: './contacto-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoNuevoComponent { }
