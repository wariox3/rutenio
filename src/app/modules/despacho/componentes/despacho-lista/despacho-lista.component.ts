import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-despacho-lista',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>despacho-lista works!</p>`,
  styleUrl: './despacho-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoListaComponent { }
