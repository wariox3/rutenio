import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-despacho-formulario',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>despacho-formulario works!</p>`,
  styleUrl: './despacho-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoFormularioComponent { }
