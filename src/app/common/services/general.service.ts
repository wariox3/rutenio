import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { catchError, Observable, of } from 'rxjs';
import { General } from '../clases/general';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Subdomino } from '../clases/subdominio';
import { AlertaService } from './alerta.service';
import { RespuestaAutocompletar } from '../../interfaces/general/autocompletar.interface';
import { ParametrosConsulta } from '../../interfaces/general/api.interface';
import { FilterTransformerService } from '../../core/servicios/filter-transformer.service';

@Injectable({
  providedIn: 'root',
})
export class GeneralService extends Subdomino {
  private _alertaService = inject(AlertaService);
  private _filterTransformerService = inject(FilterTransformerService);

  constructor(private http: HttpService, private _httpClient: HttpClient) {
    super();
  }

  listaAutocompletar<T>(modelo: string) {
    return this.http.post<RespuestaAutocompletar<T>>(
      'general/funcionalidad/lista/',
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
        limite: 1000,
        desplazar: 0,
        ordenamientos: [],
        limite_conteo: 10000,
        modelo,
        serializador: 'ListaAutocompletar',
      }
    );
  }

  autocompletar<T>(filtros: ParametrosConsulta) {
    return this.http.post<RespuestaAutocompletar<T>>(
      'general/funcionalidad/lista/',
      filtros
    );
  }

  importar(url: string, data: any) {
    return this.http.post<{ mensaje: string }>(url, data);
  }

  public descargarArchivoLocal(fileUrl: string, nombreArchivo: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = nombreArchivo;
    // Añadir el enlace al DOM y hacer clic en él para iniciar la descarga
    document.body.appendChild(link);
    link.click();
    // Eliminar el enlace del DOM
    document.body.removeChild(link);
  }

  public descargarArchivo(endpoint: string, data: any): void {
    this._alertaService.mensajaEspera('Cargando');
    const query = this._filterTransformerService.toQueryString({
      ...data,
    });
    this.http.descargarArchivoPorGet(
      `${endpoint}/?excel=1${endpoint ? `&${query}` : ''}`,
    )
  }

  public imprimir(endpoint: string, data: any): void {
    this._alertaService.mensajaEspera('Cargando');
    const query = this._filterTransformerService.toQueryString({
      ...data,
    });
        this.http.descargarArchivoPorGet(
      `${endpoint}/?${endpoint ? `&${query}` : ''}`,
    )
  }

  puntoOrigen() {
    const body = {
      campos: ['rut_latitud', 'rut_longitud'],
    };

    return this.http.post<any>(
      'general/configuracion/consulta/',
      body
    );
  }

  consultaApi<T>(endpoint: string, queryParams: { [key: string]: any } = {}) {
    let params = new HttpParams();

    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== null && queryParams[key] !== undefined) {
        params = params.append(key, queryParams[key].toString());
      }
    });

    return this.http.getDetalle<T>(endpoint, params);
  }

}
