import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FechasService {
  meses = {
    es: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  };

  constructor(private store: Store) {}

  obtenerPrimerDiaDelMes(date: Date): string {
    const primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
    const primerDiaFormateado = primerDia.toISOString().split('T')[0];
    return primerDiaFormateado;
  }

  obtenerUltimoDiaDelMes(date: Date): string {
    const primerDiaDelSiguienteMes = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      1,
    );

    const ultimoDia = new Date(primerDiaDelSiguienteMes.getTime() - 1);
    ultimoDia.setDate(ultimoDia.getDate() - 1);

    const ultimoDiaFormateado = ultimoDia.toISOString().split('T')[0];
    return ultimoDiaFormateado;
  }

  obtenerPrimerDiaDelMesSiguiente(): string {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const mesSiguiente = mesActual + 1;

    const primerDiaDelMesSiguiente = new Date(
      fechaActual.getFullYear(),
      mesSiguiente,
      1,
    );

    const año = primerDiaDelMesSiguiente.getFullYear();
    const mes = String(primerDiaDelMesSiguiente.getMonth() + 1).padStart(
      2,
      '0',
    );
    const dia = String(primerDiaDelMesSiguiente.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  }

  getFechaVencimientoInicial() {
    const fechaActual = new Date();
    const fullAnio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;

    return `${fullAnio}-${mes.toString().padStart(2, '0')}-${fechaActual
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  obtenerFechaActualFormateada(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // getMonth() es 0-indexado
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  }
}
