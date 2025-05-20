import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../common/services/http.service';
import { RespuestaLista } from '../types/api.type';
import { ParametrosConsulta } from '../../interfaces/general/api.interface';

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
}
