import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
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
  public limite: number = 50;
  public desplazamiento: number = 0;

  constructor() {
    this.paginar = new EventEmitter();
  }

  aumentarDesplazamiento() {
    console.log(this.desplazamiento, this.limite);
    this.desplazamiento += this.limite;
    this.paginar.emit({ limite: this.limite, desplazar: this.desplazamiento });
  }

  disminuirDesplazamiento() {
    this.desplazamiento -= this.limite;
    console.log(this.desplazamiento, this.limite);
    this.paginar.emit({ limite: this.limite, desplazar: this.desplazamiento });
  }
}
