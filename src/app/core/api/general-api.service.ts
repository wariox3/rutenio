import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../common/services/http.service';
import { RespuestaLista } from '../types/api.type';
import { ParametrosConsulta } from '../../interfaces/general/api.interface';
import { Configuracion } from '../../modules/configuracion/types/configuracion.types';

@Injectable({
  providedIn: 'root',
})
export class GeneralApiService {
  private _httpService = inject(HttpService);

  getLista<T>(filtros: Partial<ParametrosConsulta>) {
    return this._httpService.post<RespuestaLista<T>>(
      'general/funcionalidad/lista/',
      filtros
    );
  }

  guardarConfiguracion(configuracion: any, id: number) {
    return this._httpService.put(`general/configuracion/${id}/`, configuracion);
  }

  getConfiguracion(id: number) {
    return this._httpService.getDetalle<Configuracion>(`general/configuracion/${id}/`);
  }
}
