import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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
  radius: number = 12; // Cambia aquí el radio para que coincida con el tamaño reducido
  circumference: number = 2 * Math.PI * this.radius;

  ngOnInit() {
    this.progress = Math.min(100, Math.max(0, this.progress));
  }
}
