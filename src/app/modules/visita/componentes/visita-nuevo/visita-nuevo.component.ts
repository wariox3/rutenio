import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visita-nuevo',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>visita-nuevo works!</p>`,
  styleUrl: './visita-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaNuevoComponent { }
