import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visita-importar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>visita-importar works!</p>`,
  styleUrl: './visita-importar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaImportarComponent { }
