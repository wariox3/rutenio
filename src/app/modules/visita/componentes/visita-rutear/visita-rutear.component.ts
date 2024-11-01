import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visita-rutear',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>visita-rutear works!</p>`,
  styleUrl: './visita-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaRutearComponent { }
