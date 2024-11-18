import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-paginacion-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion-default.component.html',
  styleUrl: './paginacion-default.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginacionDefaultComponent {
  @Output() paginar: EventEmitter<{ limite: number; desplazar: number }>;
  @Input() totalPaginas: number = 1;
  @Input() limite: number = 50;
  public paginaActual: number = 1;
  public desplazamiento: number = 0;

  constructor() {
    this.paginar = new EventEmitter();
  }

  aumentarDesplazamiento() {
    this.desplazamiento += this.limite;
    this.paginaActual++;
    this.paginar.emit({ limite: this.limite, desplazar: this.desplazamiento });
  }

  disminuirDesplazamiento() {
    this.desplazamiento -= this.limite;
    this.paginaActual--;
    this.paginar.emit({ limite: this.limite, desplazar: this.desplazamiento });
  }
}
