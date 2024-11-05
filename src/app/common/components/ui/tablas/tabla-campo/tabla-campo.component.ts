import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-tabla-campo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-campo.component.html',
  styleUrl: './tabla-campo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaCampoComponent {
  @Input() datoCampo: any;
  @Input() tipoCampo: string;
}
