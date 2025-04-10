import { Injectable } from '@angular/core';
import { HttpService } from '../../common/services/http.service';
import { RespuestaGeneralLista } from '../../interfaces/general/api.interface';
import { Ubicacion } from '../../interfaces/ubicacion/ubicacion.interface';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  constructor(private http: HttpService) {}

  generalLista(data: any) {
    return this.http.post<RespuestaGeneralLista<Ubicacion>>(
      `general/funcionalidad/lista/`,
      data
    );
  }

  listarVisitas(data: any) {
    return this.http.post<any[]>(`ruteo/visita/lista/`, data);
  }
}
