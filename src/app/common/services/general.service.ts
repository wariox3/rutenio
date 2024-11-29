import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { catchError, Observable, of } from 'rxjs';
import { General } from '../clases/general';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subdomino } from '../clases/subdominio';
import { AlertaService } from './alerta.service';
import { RespuestaAutocompletar } from '../../interfaces/general/autocompletar.interface';

@Injectable({
  providedIn: 'root',
})
export class GeneralService extends Subdomino {
  private _alertaService = inject(AlertaService);

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
            operador: '__icontains',
            propiedad: 'nombre__icontains',
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
    const url = `${this.urlSubDominio}/${endpoint}`;
    this._alertaService.mensajaEspera('Cargando');
    this._httpClient
      .post<HttpResponse<Blob>>(url, data, {
        observe: 'response',
        responseType: 'blob' as 'json',
      })
      .pipe(
        catchError((error) => {
          this._alertaService.cerrarMensajes();
          this._alertaService.mensajeError(
            `Error 15`,
            'El documento no tiene un formato'
          );
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response !== null) {
          const headers = response.headers as HttpHeaders;

          let nombreArchivo = headers
            .get('Content-Disposition')!
            .split(';')[1]
            .trim()
            .split('=')[1];
          nombreArchivo = decodeURI(nombreArchivo.replace(/"/g, ''));

          if (!nombreArchivo) {
            console.log('fileName error');
            return;
          }
          const data: any = response.body;

          if (data !== null) {
            const blob = new Blob([data], {
              type: data?.type,
            });
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('style', 'display:none');
            a.setAttribute('href', objectUrl);
            a.setAttribute('download', nombreArchivo);
            a.click();
            URL.revokeObjectURL(objectUrl);
            setTimeout(() => this._alertaService.cerrarMensajes(), 1000);
          }
        }
      });
  }
}
