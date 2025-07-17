import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../common/services/http.service';
import { RespuestaLista } from '../types/api.type';
import { ParametrosConsulta } from '../../interfaces/general/api.interface';
import { Configuracion } from '../../modules/configuracion/types/configuracion.types';
import { HttpParams } from '@angular/common/http';

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

  consultaApi<T>(endpoint: string, queryParams: { [key: string]: any } = {}) {
    let params = new HttpParams();

    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== null && queryParams[key] !== undefined) {
        params = params.append(key, queryParams[key].toString());
      }
    });

    return this._httpService.getDetalle<T>(endpoint, params);
  }

  importarArchivo(endpoint: string, data: { [key: string]: any }) {
    return this._httpService.post(endpoint, data);
  }

  guardarConfiguracion(configuracion: any, id: number) {
    return this._httpService.put(`general/configuracion/${id}/`, configuracion);
  }

  getConfiguracion(id: number) {
    return this._httpService.getDetalle<Configuracion>(`general/configuracion/${id}/`);
  }
}
