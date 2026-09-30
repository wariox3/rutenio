import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
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
export class PaginacionDefaultComponent implements OnChanges {
  @Output() paginar: EventEmitter<{ limite: number; desplazar: number }> =
    new EventEmitter();
  @Input() limite: number = 50;
  @Input() totalRegistros: number = 0;
  @Input() maxPaginasVisibles: number = 5;

  public totalPaginas: number = 1;
  public paginaActual: number = 1;
  public desplazamiento: number = 0;

  constructor() {}

  ngOnChanges(): void {    
    this.totalPaginas = this.calcularCantidadPaginas(
      this.totalRegistros,
      this.limite
    );
  }

  private calcularCantidadPaginas(
    totalRegistros: number,
    limite: number
  ): number {
    const paginas = Math.floor(totalRegistros / limite);
    const registrosSobrantes = totalRegistros % limite;

    return registrosSobrantes > 0 ? paginas + 1 : paginas;
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];

    const inicio = Math.max(
      1,
      this.paginaActual - Math.floor(this.maxPaginasVisibles / 2)
    );
    const fin = Math.min(
      this.totalPaginas,
      inicio + this.maxPaginasVisibles - 1
    );

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.desplazamiento = (pagina - 1) * this.limite;
      this.paginar.emit({
        limite: this.limite,
        desplazar: this.desplazamiento,
      });
    }
  }

  aumentarDesplazamiento() {
    if (this.paginaActual < this.totalPaginas) {
      this.irAPagina(this.paginaActual + 1);
    }
  }

  disminuirDesplazamiento() {
    if (this.paginaActual > 1) {
      this.irAPagina(this.paginaActual - 1);
    }
  }

  get puedeAvanzar(): boolean {
    return this.paginaActual < this.totalPaginas;
  }

  get puedeRetroceder(): boolean {
    return this.paginaActual > 1;
  }
}
