import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TablaCampoComponent } from '../tabla-campo/tabla-campo.component';
import { General } from '../../../../clases/general';

@Component({
  selector: 'app-tabla-comun',
  standalone: true,
  imports: [CommonModule, TablaCampoComponent],
  templateUrl: './tabla-comun.component.html',
  styleUrl: './tabla-comun.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComunComponent extends General implements OnInit, OnChanges {
  @Input({ required: true }) campoMapeo: string;
  @Input({ required: true }) mapeo: any[];
  @Input() datos: any[] = [];
  @Output() emitirEditarItem: EventEmitter<number>;
  @Output() emitirDetalleItem: EventEmitter<number>;
  @Output() emitirItemsSeleccionados: EventEmitter<number[]>;

  public encabezados: any[];
  private _itemsAEliminar: number[] = [];

  @ViewChild('checkboxGlobal', { static: false })
  checkboxGlobal: ElementRef<HTMLInputElement>;

  constructor() {
    super();
    this.emitirEditarItem = new EventEmitter();
    this.emitirDetalleItem = new EventEmitter();
    this.emitirItemsSeleccionados = new EventEmitter();
  }

  ngOnInit(): void {
    this.encabezados = this.mapeo?.[this.campoMapeo]?.datos
      ?.filter((dato) => dato.visibleTabla === true)
      ?.map((dato) => dato);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && !changes['datos'].firstChange) {
      // Reiniciar _itemsAEliminar si los datos cambian
      this._itemsAEliminar = [];
      this.emitirItemsSeleccionados.emit(this._itemsAEliminar);

      if (this.checkboxGlobal) {
        this.checkboxGlobal.nativeElement.checked = false;
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  editarItem(id: number) {
    this.emitirEditarItem.emit(id);
  }

  detalleItem(id: number) {
    this.emitirDetalleItem.emit(id);
  }

  manejarCheckItem(event: any, id: number) {
    if (event.target.checked) {
      this.agregarItemAListaEliminar(id);
    } else {
      this.removerItemDeListaEliminar(id);
    }

    this.emitirItemsSeleccionados.emit(this._itemsAEliminar);
  }

  manejarCheckGlobal(event: any) {
    if (event.target.checked) {
      this.agregarTodosLosItemsAListaEliminar();
    } else {
      this.removerTodosLosItemsAListaEliminar();
    }

    this.emitirItemsSeleccionados.emit(this._itemsAEliminar);
  }

  agregarItemAListaEliminar(id: number) {
    this._itemsAEliminar.push(id);
  }

  removerItemDeListaEliminar(id: number) {
    const itemsFiltrados = this._itemsAEliminar.filter((item) => item !== id);
    this._itemsAEliminar = itemsFiltrados;
  }

  agregarTodosLosItemsAListaEliminar() {
    this.datos.forEach((item) => {
      const indexItem = this._itemsAEliminar.indexOf(item.id);

      if (indexItem === -1) {
        this._itemsAEliminar.push(item.id);
      }
    });
  }

  removerTodosLosItemsAListaEliminar() {
    this._itemsAEliminar = [];
  }

  estoyEnListaEliminar(id: number): boolean {
    return this._itemsAEliminar.indexOf(id) !== -1;
  }
}
