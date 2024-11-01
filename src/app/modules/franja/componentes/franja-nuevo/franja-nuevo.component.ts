import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-franja-nuevo',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>franja-nuevo works!</p>`,
  styleUrl: './franja-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaNuevoComponent { }
