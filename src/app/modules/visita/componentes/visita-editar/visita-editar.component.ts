import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visita-editar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>visita-editar works!</p>`,
  styleUrl: './visita-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaEditarComponent { }
