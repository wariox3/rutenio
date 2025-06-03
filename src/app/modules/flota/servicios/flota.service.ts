import { Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { ListaFlota } from '../../../interfaces/flota/flota.interface';
import {
  ParametrosConsulta,
  RespuestaGeneralLista,
} from '../../../interfaces/general/api.interface';

@Injectable({
  providedIn: 'root',
})
export class FlotaService {
  constructor(private http: HttpService) {}

  lista(parametros: ParametrosConsulta) {
    return this.http.post<RespuestaGeneralLista<ListaFlota>>(
      `general/funcionalidad/lista/`,
      parametros
    );
  }

  agregarFlota(flotaId: number, prioridad: number) {
    return this.http.post<RespuestaGeneralLista<any>>(`ruteo/flota/`, {
      vehiculo: flotaId,
      prioridad,
    });
  }

  eliminarFlota(flotaId: number) {
    return this.http.delete(`ruteo/flota/${flotaId}`, {});
  }

  actualizarPrioridad(flotaId: number, prioridad: number) {
    return this.http.post(`ruteo/flota/cambiar-prioridad/`, {
      id: flotaId,
      prioridad,
    });
  }
}
