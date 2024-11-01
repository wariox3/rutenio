import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-despacho-importar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>despacho-importar works!</p>`,
  styleUrl: './despacho-importar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoImportarComponent { }
