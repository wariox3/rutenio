import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class VisitaRutearService {
  private readonly _httpService = inject(HttpService);

  constructor() {}

  ubicarFranja() {
    return this._httpService.post<{ mensaje: string }>(`ruteo/visita/ubicar/`, {});
  }
}
