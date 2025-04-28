import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormatFechaPipe } from '../../../../pipes/formatear_fecha';

@Component({
  selector: 'app-tabla-campo',
  standalone: true,
  imports: [CommonModule, FormatFechaPipe],
  templateUrl: './tabla-campo.component.html',
  styleUrl: './tabla-campo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaCampoComponent {
  @Input() datoCampo: any;
  @Input() tipoCampo: string;
}
