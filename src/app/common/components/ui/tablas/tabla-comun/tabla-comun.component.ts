import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
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
  @Input({ required: true }) campoMapeo: string;
  @Input({ required: true }) mapeo: any[];
  @Input() datos: any[] = [];

  public encabezados: any[];

  ngOnInit(): void {
    this.encabezados = this.mapeo?.[this.campoMapeo]?.datos
      ?.filter((dato) => dato.visibleTabla === true)
      ?.map((dato) => dato);
  }
}
