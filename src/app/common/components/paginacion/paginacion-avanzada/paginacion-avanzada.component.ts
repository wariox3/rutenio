import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormatoPaginacionDirective } from '../../../directivas/formato-paginacion.directive';

@Component({
  selector: 'app-paginacion-avanzada',
  standalone: true,
  imports: [CommonModule, FormatoPaginacionDirective],
  templateUrl: './paginacion-avanzada.component.html',
  styleUrl: './paginacion-avanzada.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginacionAvanzadaComponent {
  @Input() cantidadRegistros: number = 0;
  @Input() registrosAMostrar: number = 50;
  @ViewChild('input') input!: ElementRef;
  @Output() emitirPaginacion = new EventEmitter<{
    desplazamiento: number;
    limite: number;
  }>();

  desplazamientoActual: number = 0;
  limiteActual: number = this.registrosAMostrar;
  incrementar: number = this.limiteActual;
  valorDerecha: number = this.limiteActual;
  valoresInput$ = new BehaviorSubject(
    `${this.desplazamientoActual + 1}-${this.limiteActual}`
  );

  aumentarDesplazamiento() {
    this.desplazamientoActual += this.incrementar;
    this.valorDerecha += this.incrementar;
    this.valoresInput$.next(
      `${this.desplazamientoActual + 1}-${this.valorDerecha}`
    );
    this.input.nativeElement.value = `${this.desplazamientoActual + 1}-${
      this.valorDerecha
    }`;
    this.emitirPaginacion.emit({
      desplazamiento: this.desplazamientoActual,
      limite: this.limiteActual,
    });
  }

  resetearFiltrado() {
    this.desplazamientoActual = 0;
    this.limiteActual = this.registrosAMostrar;
    this.incrementar = this.limiteActual;
    this.valorDerecha = this.limiteActual;
    this.emitirPaginacion.emit({
      desplazamiento: this.desplazamientoActual,
      limite: this.limiteActual,
    });
    this.input.nativeElement.value = `${this.desplazamientoActual + 1}-${
      this.valorDerecha
    }`;
    this.valoresInput$.next(
      `${this.desplazamientoActual + 1}-${this.valorDerecha}`
    );
  }

  disminuirDesplazamiento() {
    const diferencia = this.valorDerecha - this.desplazamientoActual;
    // Sin suficiente historial para retroceder: se resetea la paginación.
    if (diferencia > this.desplazamientoActual) {
      this.resetearFiltrado();
      return;
    }

    if (this.desplazamientoActual > 0) {
      this.desplazamientoActual -= this.incrementar;
      this.valorDerecha -= this.incrementar;
      this.valoresInput$.next(
        `${this.desplazamientoActual + 1}-${this.valorDerecha}`
      );
      this.emitirPaginacion.emit({
        desplazamiento: this.desplazamientoActual,
        limite: this.limiteActual,
      });
    }
  }

  calcularValorMostrar(evento: Event) {
    const input = evento.target as HTMLInputElement;
    let valorInicial = input.value.trim();
    const regex = /^\d+-\d+$/;

    if (!regex.test(valorInicial)) {
      this.resetearFiltrado();
      return;
    }

    let [limite, desplazamiento] = valorInicial.split('-')?.map(Number);
    let nuevoDesplazamiento: number;

    if (limite <= 0 || desplazamiento <= 0 || limite > desplazamiento) {
      this.resetearFiltrado();
      return;
    }

    if (limite > 0) {
      nuevoDesplazamiento = desplazamiento - limite + 1;
      this.emitirPaginacion.emit({
        desplazamiento: limite - 1,
        limite: nuevoDesplazamiento,
      });
    }

    this.limiteActual = desplazamiento - limite + 1;
    this.valorDerecha = desplazamiento;
    this.desplazamientoActual = limite - 1;
    this.incrementar = this.limiteActual;
  }
}
