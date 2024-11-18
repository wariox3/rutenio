import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';

@Component({
  selector: 'app-progreso-circular',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progreso-circular.component.html',
  styleUrl: './progreso-circular.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgresoCircularComponent {
  @Input() progress: number = 0; // Valor entre 0 y 100
  @Input() barraProgreso: number = 0; // Valor entre 0 y 100
  @Input() error: boolean = true;

  strokeDashoffset: number = 0;

  // Circunferencia del círculo con r = 16 (perímetro = 2 * π * r)
  readonly circumference = 2 * Math.PI * 22;

  ngOnChanges(): void {
    this.strokeDashoffset = this.circumference * (1 - this.barraProgreso / 100);
  }
}
