import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-trafico-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>trafico-lista works!</p>`,
  styleUrl: './trafico-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TraficoListaComponent { }
