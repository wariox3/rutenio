import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { Observable } from 'rxjs';
import {
  DecodificarDireccionRequest,
  DecodificarDireccionResponse,
} from '../interfaces/utilidad.interface';

@Injectable({
  providedIn: 'root',
})
export class UtilidadApiService {
  private _httpService = inject(HttpService);

  decodificarDireccion(
    data: DecodificarDireccionRequest
  ): Observable<DecodificarDireccionResponse> {
    return this._httpService.post<DecodificarDireccionResponse>(
      'contenedor/direccion/decodificar/',
      data
    );
  }
}
