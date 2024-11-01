import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visita-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>visita-lista works!</p>`,
  styleUrl: './visita-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaListaComponent { }
