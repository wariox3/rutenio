import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-franja-editar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>franja-editar works!</p>`,
  styleUrl: './franja-editar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaEditarComponent { }
