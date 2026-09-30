import { Injectable } from '@angular/core';
import { Despacho } from '../../../interfaces/despacho/despacho.interface';

@Injectable({
  providedIn: 'root',
})
export class TraficoService {
  constructor() {}

  calcularEstadoDespacho(
    fechaSalida: string,
    tiempo: number,
    visitas: number,
    visitasEntregadas: number
  ): { estado: 'tiempo' | 'retrazado' } {
    const tiempoTrafico = this._calcularTiempoTrafico(fechaSalida);
    let tiempoPromedioVisita = 0;
    let visitasEntregadasEsperadas = 0;
    let estado: 'tiempo' | 'retrazado' = 'tiempo';

    if (visitas > 0) {
      tiempoPromedioVisita = tiempo / visitas;
    }

    if (tiempoPromedioVisita > 0) {
      visitasEntregadasEsperadas = Math.round(
        tiempoTrafico / tiempoPromedioVisita
      );
    }

    if (visitasEntregadasEsperadas > visitas) {
      visitasEntregadasEsperadas = visitas;
    }

    if (visitasEntregadasEsperadas > visitasEntregadas) {
      estado = 'retrazado';
    }

    return {
      estado,
    };
  }

  agregarEstadoDespacho(arrDespachos: Despacho[]): Despacho[] {
    return arrDespachos.map((despacho) => ({
      ...despacho,
      ...this.calcularEstadoDespacho(
        despacho.fecha_salida,
        despacho.tiempo,
        despacho.visitas,
        despacho.visitas_entregadas
      ),
    }));
  }

  private _calcularTiempoTrafico(fechaSalida: string) {
    const fechaActual = new Date();
    const fechaSalidaDate = new Date(fechaSalida);
    const diferencia = fechaActual.getTime() - fechaSalidaDate.getTime();
    const tiempoTrafico = Math.floor(diferencia / (1000 * 60));
    return tiempoTrafico;
  }
}
