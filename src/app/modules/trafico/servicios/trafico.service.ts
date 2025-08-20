import { Injectable } from '@angular/core';
import { Despacho } from '../../../interfaces/despacho/despacho.interface';

@Injectable({
  providedIn: 'root',
})
export class TraficoService {
  constructor() {}

  /**
   * Calcula el estado de un despacho
   * @param fechaSalida fecha de salida del despacho
   * @param tiempo tiempo del despacho
   * @param visitas visitas del despacho
   * @param visitasEntregadas visitas entregadas del despacho
   * @returns estado del despacho
   */
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

  /**
   * Agrega el estado de cada despacho a la lista de despachos
   * @param arrDespachos lista de despachos
   * @returns lista de despachos con el estado agregado
   */
  agregarEstadoDespacho(arrDespachos: Despacho[]) {
    arrDespachos.forEach((despacho) => {
      const { estado } = this.calcularEstadoDespacho(
        despacho.fecha_salida,
        despacho.tiempo,
        despacho.visitas,
        despacho.visitas_entregadas
      );

      despacho.estado = estado;
    });

    return arrDespachos;
  }

  /**
   * Calcula el tiempo de trafico
   * @param fechaSalida fecha de salida del despacho
   * @returns tiempo de trafico
   */
  private _calcularTiempoTrafico(fechaSalida: string) {
    const fechaActual = new Date();
    const fechaSalidaDate = new Date(fechaSalida);
    const diferencia = fechaActual.getTime() - fechaSalidaDate.getTime();
    const tiempoTrafico = Math.floor(diferencia / (1000 * 60));
    return tiempoTrafico;
  }
}
