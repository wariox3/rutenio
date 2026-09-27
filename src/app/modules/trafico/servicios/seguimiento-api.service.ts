import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Seguimiento } from '../interfaces/seguimiento.interface';

@Injectable({ providedIn: 'root' })
export class SeguimientoApiService {
  private _httpService = inject(HttpService);

  // Trigger MANUAL: crea la consulta '¿como va el viaje?' pendiente para que el
  // conductor la responda en la app. El backend rechaza (409) si ya hay una
  // pendiente de ese despacho.
  consultar(despacho_id: number, opciones?: string[], pregunta?: string) {
    return this._httpService.post<Seguimiento>(`ruteo/seguimiento/consultar/`, {
      despacho_id,
      opciones,
      pregunta,
    });
  }

  // Registra una llamada telefonica hecha por el despachador como evento del
  // timeline. El backend setea usuario_id = despachador autenticado.
  registrarLlamada(despacho_id: number, comentario: string) {
    return this._httpService.post<Seguimiento>(`ruteo/seguimiento/`, {
      despacho: despacho_id,
      tipo: 'llamada',
      comentario,
    });
  }

  // Timeline completo de un viaje, en orden cronologico (sin paginar).
  timeline(despacho_id: number) {
    return this._httpService.get<Seguimiento>(
      `ruteo/seguimiento/?despacho_id=${despacho_id}&lista_completa=true&ordering=fecha_registro`
    );
  }
}
