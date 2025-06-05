import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionApiService {
  private _httpService = inject(HttpService);

  constructor() {}

  autocompletar(data: any) {
    return this._httpService.post<any[]>(`ruteo/ubicacion/autocompletar/`, {
      input: data,
    });
  }

  detalle(data: { place_id: string }) {
    return this._httpService.post<any>(`ruteo/ubicacion/detalle/`, data);
  }
}
