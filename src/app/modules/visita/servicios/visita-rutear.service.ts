import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../../common/services/http.service';
import { ParametrosConsulta } from '../../../interfaces/general/api.interface';
import { ParametrosDireccionAlternativa } from '../../../interfaces/visita/rutear.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitaRutearService {
  private readonly _httpService = inject(HttpService);

  constructor() {}

  ubicarFranja(parametros?: ParametrosConsulta) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/ubicar/`,
      parametros
    );
  }

  seleccionarDireccionAlternativa(parametros: ParametrosDireccionAlternativa) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/seleccionar-direccion-alternativa/`,
      parametros
    );
  }

  actualizarDireccion(parametros: any) {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/actualizar-direccion/`,
      parametros
    );
  }

  enviarEntregaComplemento() {
    return this._httpService.post<{ mensaje: string }>(
      `ruteo/visita/entrega-complemento/`,
      {}
    );
  }
}
