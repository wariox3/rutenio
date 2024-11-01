import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-franja-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>franja-lista works!</p>`,
  styleUrl: './franja-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaListaComponent { }
