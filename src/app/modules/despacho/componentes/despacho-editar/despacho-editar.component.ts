import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-despacho-editar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>despacho-editar works!</p>`,
  styleUrl: './despacho-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoEditarComponent { }
