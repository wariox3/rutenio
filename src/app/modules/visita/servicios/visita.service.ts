import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GeneralService } from '../../../common/services/general.service';

@Injectable({
  providedIn: 'root',
})
export class VisitaService {
  private _generalService = inject(GeneralService);

  constructor() {}

  private actualizarListaSubject = new Subject<void>();

  actualizarLista$ = this.actualizarListaSubject.asObservable();

  notificarActualizacionLista() {
    this.actualizarListaSubject.next();
  }

  // Contrato único de impresión de rótulos por despacho: todas las visitas
  // en el orden del ruteo, una etiqueta por unidad (para marcar paquetes al
  // cargar). Lo usan tráfico y el tab de visitas del despacho.
  imprimirRotulosDespacho(despachoId: number, formato: 'termica' | 'a4' = 'termica') {
    this._generalService.imprimir('ruteo/visita/imprimir-rotulo/', {
      despacho_id: despachoId,
      formato,
      por_unidad: true,
    });
  }
}
