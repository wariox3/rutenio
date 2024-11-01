import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-franja-formulario',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>franja-formulario works!</p>`,
  styleUrl: './franja-formulario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaFormularioComponent { }
