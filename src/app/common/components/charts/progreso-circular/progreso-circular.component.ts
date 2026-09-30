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
  @Input() progress: number = 0;
  @Input() barraProgreso: number = 0;
  @Input() error: boolean = true;

  strokeDashoffset: number = 0;

  readonly circumference = 2 * Math.PI * 22;

  ngOnChanges(): void {
    this.strokeDashoffset = this.circumference * (1 - this.barraProgreso / 100);
  }

  // Abrevia en K a partir de 1000% para evitar desbordamiento visual.
  get formattedProgress(): string {
    const value = Math.round(this.progress);
    
    if (value < 1000) {
      return `${value}%`;
    } else if (value < 10000) {
      const kValue = (value / 1000).toFixed(1);
      return `${kValue}K%`;
    } else {
      const kValue = Math.round(value / 1000);
      return `${kValue}K%`;
    }
  }

  get fontSizeClass(): string {
    const value = Math.round(this.progress);
    return value >= 1000 ? 'text-[11px]' : 'text-xs';
  }
}
