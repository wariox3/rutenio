import { Injectable } from '@angular/core';
import {
  ListaVehiculo,
  Vehiculo,
} from '../../../interfaces/vehiculo/vehiculo.interface';
import { HttpService } from '../../../common/services/http.service';
import {
  ParametrosConsulta,
  RespuestaGeneralLista,
} from '../../../interfaces/general/api.interface';
import {
  AutocompletarCiudades,
  RespuestaAutocompletar,
} from '../../../interfaces/general/autocompletar.interface';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  constructor(private http: HttpService) {}

  lista(parametros: ParametrosConsulta) {
    return this.http.post<RespuestaGeneralLista<ListaVehiculo>>(
      `general/funcionalidad/lista/`,
      parametros
    );
  }

  listaAutocompletar(modelo: string) {
    return this.http.post<{ cantidad_registros: number; registros: any[] }>(
      'general/funcionalidad/autocompletar/',
      {
        filtros: [
          {
            id: '1692284537644-1688',
            operador: 'icontains',
            propiedad: 'nombre',
            valor1: ``,
            valor2: '',
          },
        ],
        limite: 0,
        desplazar: 0,
        ordenamientos: [],
        limite_conteo: 10000,
        modelo,
      }
    );
  }

  listaCiudades(arrFiltros: ParametrosConsulta) {
    return this.http.post<RespuestaAutocompletar<AutocompletarCiudades>>(
      'general/funcionalidad/autocompletar/',
      arrFiltros
    );
  }

  guardarVehiculo(data: any) {
    return this.http.post<any[]>(`ruteo/vehiculo/`, data);
  }

  actualizarDatosVehiculo(id: number, data: any) {
    return this.http.put<any>(`ruteo/vehiculo/${id}/`, data);
  }

  consultarDetalle(id: number) {
    return this.http.getDetalle<any>(`ruteo/vehiculo/${id}/`);
  }
}
