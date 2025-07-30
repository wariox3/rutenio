import { Component, EventEmitter, Input, OnChanges, OnInit, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-paginador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './paginador.component.html',
  styleUrl: './paginador.component.scss',
})
export class PaginadorComponent implements OnChanges, OnInit, OnDestroy { 
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() itemsPerPage: number = 30;
  @Input() totalItems: number = 0;
  @Output() pageChange = new EventEmitter<number>();
  private routerSubscription: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Cuando la URL cambia (detectado por NavigationEnd),
      // reiniciamos currentPage a 1 y recalculamos.
      this.currentPage = 1;
      this.calculateTotalPages();
      // No se emite pageChange aquí, según la preferencia del usuario.
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems']) {
      // Cuando totalItems cambia, reiniciamos currentPage a 1.
      // Esto puede ser por una navegación (redundante con ngOnInit si la URL cambió)
      // o por un cambio de datos sin navegación (ej. filtro local).
      this.currentPage = 1;
      this.calculateTotalPages();
    } else if (changes['itemsPerPage']) {
      // Si solo itemsPerPage cambia, recalculamos las páginas.
      this.calculateTotalPages();
    }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }
    // Asegurar que currentPage sea al menos 1 si totalPages es 0
    if (this.totalPages === 0) {
        this.currentPage = 1;
    }
  }

  onPageChange(newPage: number): void {
    const parsedPage = Number(newPage);
    // Permitir 0 páginas si no hay items, pero el input debe ser >= 1 si hay páginas.
    const maxAllowedPage = this.totalPages > 0 ? this.totalPages : 1;

    if (isNaN(parsedPage) || parsedPage < 1 || parsedPage > maxAllowedPage) {
      setTimeout(() => {
        // Revertir al valor actual o a 1 si el actual es inválido (ej. después de un reset)
        const validCurrentPage = (this.currentPage >= 1 && this.currentPage <= maxAllowedPage) ? this.currentPage : 1;
        this.currentPage = validCurrentPage;
      });
      return;
    }

    this.currentPage = parsedPage;
    this.pageChange.emit(this.currentPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
