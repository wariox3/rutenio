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
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TablaCampoComponent } from '../tabla-campo/tabla-campo.component';
import { General } from '../../../../clases/general';

export interface AccionFila {
  /** Clase del icono Metronic (ki-filled o ki-outline). */
  icono: string;
  /** Texto visible en el dropdown. */
  label: string;
  /** Predicate opcional. Si retorna false, la accion no aparece para ese item. */
  mostrar?: (item: any) => boolean;
  /** Callback al hacer click. */
  ejecutar: (item: any) => void;
  /** Estilo opcional (ej. 'danger' para acciones destructivas). */
  variante?: 'default' | 'danger';
}

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
  @Input() ocultarEditar: boolean = false;
  @Input() ordenamientoInicial: string = '';
  /** Callback opcional para marcar filas con un highlight visual (border-left amber). */
  @Input() resaltarFila?: (item: any) => boolean;
  /** Acciones extra disponibles en un menu kebab por fila. */
  @Input() accionesFila: AccionFila[] = [];
  @Output() emitirEditarItem: EventEmitter<number>;
  @Output() emitirDetalleItem: EventEmitter<number>;
  @Output() emitirItemsSeleccionados: EventEmitter<number[]>;
  @Output() emitirOrdenamiento = new EventEmitter<string>();

  public encabezados: any[];
  public columnaOrdenada = signal<string | null>(null);
  public direccionOrden = signal<'asc' | 'desc' | null>(null);
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

    if (this.ordenamientoInicial) {
      if (this.ordenamientoInicial.startsWith('-')) {
        this.columnaOrdenada.set(this.ordenamientoInicial.substring(1));
        this.direccionOrden.set('desc');
      } else {
        this.columnaOrdenada.set(this.ordenamientoInicial);
        this.direccionOrden.set('asc');
      }
    }
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

  /** Limpia la seleccion programaticamente desde el padre. */
  public limpiarSeleccion(): void {
    this._itemsAEliminar = [];
    if (this.checkboxGlobal) {
      this.checkboxGlobal.nativeElement.checked = false;
    }
    this.emitirItemsSeleccionados.emit(this._itemsAEliminar);
    this.changeDetectorRef.detectChanges();
  }

  estoyEnListaEliminar(id: number): boolean {
    return this._itemsAEliminar.indexOf(id) !== -1;
  }

  /** Devuelve solo las acciones que deben mostrarse para un item dado. */
  accionesVisibles(item: any): AccionFila[] {
    return (this.accionesFila || []).filter((a) => !a.mostrar || a.mostrar(item));
  }

  toggleOrdenamiento(campoNombre: string): void {
    if (this.columnaOrdenada() === campoNombre) {
      const actual = this.direccionOrden();
      if (actual === 'desc') {
        this.direccionOrden.set('asc');
        this.emitirOrdenamiento.emit(campoNombre);
      } else if (actual === 'asc') {
        this.columnaOrdenada.set(null);
        this.direccionOrden.set(null);
        this.emitirOrdenamiento.emit('');
      } else {
        this.direccionOrden.set('desc');
        this.emitirOrdenamiento.emit(`-${campoNombre}`);
      }
    } else {
      this.columnaOrdenada.set(campoNombre);
      this.direccionOrden.set('desc');
      this.emitirOrdenamiento.emit(`-${campoNombre}`);
    }
  }
}
