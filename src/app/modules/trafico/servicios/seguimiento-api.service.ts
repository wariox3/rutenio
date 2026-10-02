import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Seguimiento } from '../interfaces/seguimiento.interface';

@Injectable({ providedIn: 'root' })
export class SeguimientoApiService {
  private _httpService = inject(HttpService);

  // Trigger MANUAL: crea la consulta '¿como va el viaje?' pendiente para que el
  // conductor la responda en la app. El seguimiento es por CONDUCTOR (no por
  // despacho): el backend rechaza (409) si ya hay una pendiente del conductor.
  consultar(conductor_id: number, opciones?: string[], pregunta?: string) {
    return this._httpService.post<Seguimiento>(`ruteo/seguimiento/consultar/`, {
      conductor_id,
      opciones,
      pregunta,
    });
  }

  // Registra una llamada telefonica hecha por el despachador en el hilo del
  // conductor. El backend setea usuario_id = despachador autenticado.
  registrarLlamada(conductor_id: number, comentario: string) {
    return this._httpService.post<Seguimiento>(`ruteo/seguimiento/`, {
      conductor_id,
      tipo: 'llamada',
      comentario,
    });
  }

  // Timeline completo del conductor (todas sus ordenes), cronologico, sin paginar.
  timeline(conductor_id: number) {
    return this._httpService.get<Seguimiento>(
      `ruteo/seguimiento/?conductor_id=${conductor_id}&lista_completa=true&ordering=fecha_registro`
    );
  }
}
