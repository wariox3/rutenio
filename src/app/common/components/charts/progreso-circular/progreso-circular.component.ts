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

  /**
   * Formatea el porcentaje de manera inteligente para evitar desbordamiento
   * 0-999%: Mostrar normal (ej: "85%")
   * 1000-9999%: Mostrar en miles con 1 decimal (ej: "9.3K%")
   * 10000+%: Mostrar abreviado sin decimales (ej: "92K%")
   */
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

  /**
   * Determina el tamaño de fuente según el valor del porcentaje
   * >= 1000: text-[11px] (más pequeño para valores grandes)
   * < 1000: text-xs (tamaño normal)
   */
  get fontSizeClass(): string {
    const value = Math.round(this.progress);
    return value >= 1000 ? 'text-[11px]' : 'text-xs';
  }
}
