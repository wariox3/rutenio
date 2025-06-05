import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Subdomino } from '../clases/subdominio';
import { AlertaService } from './alerta.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService extends Subdomino {
  constructor(private http: HttpClient, private alertaService: AlertaService) {
    super();
  }

  // Método GET detalle
  public getDetalle<T>(endpoint: string): Observable<T> {
    const url = `${this.urlSubDominio}/${endpoint}`;
    return this.http.get<T>(url);
  }

  // Método GET para listas
  public get<T>(endpoint: string): Observable<T[]> {
    const url = `${this.urlSubDominio}/${endpoint}`;
    return this.http.get<T[]>(url);
  }

  // Método POST
  public post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.urlSubDominio}/${endpoint}`;
    return this.http.post<T>(url, data);
  }

  // Método PUT
  public put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.urlSubDominio}/${endpoint}`;
    return this.http.put<T>(url, data);
  }

  // Método DELETE
  public delete(endpoint: string, data: any): Observable<any> {
    const url = `${this.urlSubDominio}/${endpoint}`;
    return this.http.delete(url, data);
  }


  public patch<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.urlSubDominio}/${endpoint}`;
    return this.http.patch<T>(url, data);
  }

  public descargarArchivo(endpoint: string, data: any): void {
    const url = `${this.urlSubDominio}/${endpoint}`;
    this.alertaService.mensajaEspera('Cargando');
    this.http
      .post<HttpResponse<Blob>>(url, data, {
        observe: 'response',
        responseType: 'blob' as 'json',
      })
      .pipe(
        catchError((error) => {
          this.alertaService.cerrarMensajes();
          this.alertaService.mensajeError(
            `Error 15`,
            'El documento no tiene un formato'
          );
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response !== null) {
          const headers = response.headers as HttpHeaders;
          if (headers.get('Content-Disposition') !== null) {
            let nombreArchivo = headers
              .get('Content-Disposition')!
              .split(';')[1]
              .trim()
              .split('=')[1];
            nombreArchivo = decodeURI(nombreArchivo.replace(/"/g, ''));

            if (!nombreArchivo) {
              throw new Error('fileName error')
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
              setTimeout(() => this.alertaService.cerrarMensajes(), 1000);
            }
          } else {
            setTimeout(() => this.alertaService.cerrarMensajes(), 1000);
            throw new Error('Error no existe Content-Disposition')
          }
        }
      });
  }

  public descargarArchivoDominio(endpoint: string, data: any): void {
    const url = `${this.urlSubDominio}/${endpoint}`;
    this.alertaService.mensajaEspera('Cargando');
    this.http
      .post<HttpResponse<Blob>>(url, data, {
        // observe: 'response',
        // responseType: 'blob' as 'json',
      })
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
            setTimeout(() => this.alertaService.cerrarMensajes(), 1000);
          }
        }
      });
  }
}
