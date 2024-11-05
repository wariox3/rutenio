import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { mapeo } from '../../../../mapeos/administradores';
import { TablaCampoComponent } from '../tabla-campo/tabla-campo.component';

@Component({
  selector: 'app-tabla-comun',
  standalone: true,
  imports: [CommonModule, TablaCampoComponent],
  templateUrl: './tabla-comun.component.html',
  styleUrl: './tabla-comun.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComunComponent implements OnInit {
  @Input() campoMapeo: string;
  @Input() datos: any[];
  public encabezados: any[];

  ngOnInit(): void {
    this.encabezados = mapeo?.[this.campoMapeo]?.datos
      ?.filter((dato) => dato.visibleTabla === true)
      ?.map((dato) => dato);
  }
}
