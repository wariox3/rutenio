import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visita-formulario',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>visita-formulario works!</p>`,
  styleUrl: './visita-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaFormularioComponent { }
