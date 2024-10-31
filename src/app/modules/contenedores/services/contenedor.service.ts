import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ContenedorDetalle, ListaContenedoresRespuesta } from '../../../interfaces/contenedor/contenedor.interface';

@Injectable({
  providedIn: 'root'
})
export class ContenedorService {

  constructor(private http : HttpClient,) { }

  lista(usuario_id: string) {
    return this.http.post<ListaContenedoresRespuesta>(
      `${environment.url_api}/contenedor/usuariocontenedor/consulta-usuario/`,
      {
        usuario_id,
        ruteo: true
      }
    );
  }

  listaTipoIdentificacion() {
    return this.http.post<any[]>(
      `${environment.url_api}/contenedor/funcionalidad/lista-autocompletar/`,
      {
        filtros: [],
        limite: 10,
        desplazar: 0,
        ordenamientos: [],
        limite_conteo: 10000,
        modelo: 'CtnIdentificacion',
      }
    );
  }

  listaPlanes() {
    return this.http.get<any[]>(
      `${environment.url_api}/contenedor/plan/`
    );
  }

  listaCiudades(arrFiltros: any) {
    return this.http.post<any[]>(
      `${environment.url_api}/contenedor/funcionalidad/lista-autocompletar/`,
      arrFiltros
    );
  }

  consultarNombre(subdominio: string) {
    return this.http.post<{ validar: boolean }>(
      `${environment.url_api}/contenedor/contenedor/validar/`,
      {
        subdominio,
      }
    );
  }

  nuevo(data: any, usuario_id: string) {
    return this.http.post(
      `${environment.url_api}/contenedor/contenedor/`,
      {
        ...data,
        usuario_id
      }
    );
  }

  eliminarContenedor(contenedorId: number) {
    return this.http.delete(
      `${environment.url_api}/contenedor/contenedor/${contenedorId}/`
    );
  }

  detalle(codigoContenedor: string) {
    return this.http.get<ContenedorDetalle>(
      `${environment.url_api}/contenedor/contenedor/${codigoContenedor}/`
    );
  }

}
