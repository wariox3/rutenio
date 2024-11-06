import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
  @Output() emitirEditarItem: EventEmitter<number>;
  @Output() emitirDetalleItem: EventEmitter<number>;

  public encabezados: any[];

  constructor() {
    this.emitirEditarItem = new EventEmitter();
    this.emitirDetalleItem = new EventEmitter();
  }

  ngOnInit(): void {
    this.encabezados = this.mapeo?.[this.campoMapeo]?.datos
      ?.filter((dato) => dato.visibleTabla === true)
      ?.map((dato) => dato);
  }

  editarItem(id: number) {
    this.emitirEditarItem.emit(id);
  }

  detalleItem(id: number) {
    this.emitirDetalleItem.emit(id);
  }
}
