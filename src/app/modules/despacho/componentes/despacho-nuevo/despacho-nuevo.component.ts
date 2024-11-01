import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-despacho-nuevo',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>despacho-nuevo works!</p>`,
  styleUrl: './despacho-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoNuevoComponent { }
