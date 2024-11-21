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
  @Input() limite: number = 50; // Cantidad de elementos por página
  @Input() totalRegistros: number = 0; // Total de registros disponibles
  @Input() maxPaginasVisibles: number = 5; // Máximo de botones de páginas visibles

  public totalPaginas: number = 1; // Total de páginas calculado
  public paginaActual: number = 1; // Página actual
  public desplazamiento: number = 0; // Desplazamiento actual en la lista

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
    // Calcular el total de páginas basado en los registros disponibles
    const paginas = Math.floor(totalRegistros / limite);
    const registrosSobrantes = totalRegistros % limite;

    // Solo añadir una página extra si hay registros sobrantes
    return registrosSobrantes > 0 ? paginas + 1 : paginas;
  }

  // Calcula las páginas visibles
  get paginasVisibles(): number[] {
    const paginas: number[] = [];

    // Ajustar rango de inicio y fin
    const inicio = Math.max(
      1,
      this.paginaActual - Math.floor(this.maxPaginasVisibles / 2)
    );
    const fin = Math.min(
      this.totalPaginas,
      inicio + this.maxPaginasVisibles - 1
    );

    // Generar números de página dentro del rango
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  // Ir a una página específica
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

  // Ir a la página siguiente
  aumentarDesplazamiento() {
    if (this.paginaActual < this.totalPaginas) {
      this.irAPagina(this.paginaActual + 1);
    }
  }

  // Ir a la página anterior
  disminuirDesplazamiento() {
    if (this.paginaActual > 1) {
      this.irAPagina(this.paginaActual - 1);
    }
  }

  // Validar si la flecha de continuar debe estar activa
  get puedeAvanzar(): boolean {
    return this.paginaActual < this.totalPaginas;
  }

  // Validar si la flecha de retroceder debe estar activa
  get puedeRetroceder(): boolean {
    return this.paginaActual > 1;
  }
}
