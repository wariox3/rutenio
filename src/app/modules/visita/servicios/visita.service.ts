import { Injectable } from "@angular/core";
import { HttpService } from "../../../common/services/http.service";
import { Visita } from "../../../interfaces/visita/visita.interface";

@Injectable({
  providedIn: "root",
})
export class VisitaService {
  constructor(private http: HttpService) {}

  lista(data: any) {
    return this.http.post<Visita[]>(`ruteo/visita/lista/`, data);
  }

  listarVisitas(data: any) {
    return this.http.post<any[]>(`ruteo/visita/lista/`, data);
  }

  guardarGuias(data: any) {
    return this.http.post<any[]>(`ruteo/visita/`, data);
  }

  consultarDetalle(id: number) {
    return this.http.getDetalle<any>(`ruteo/visita/${id}/`);
  }

  importarVisitas(data: any) {
    return this.http.post<any[]>(`ruteo/visita/importar-excel/`, data);
  }

  decodificar() {
    return this.http.post<any[]>(`ruteo/visita/decodificar/`, "");
  }

  ordenar() {
    return this.http.post<any[]>(`ruteo/visita/ordenar/`, "");
  }

  rutear() {
    return this.http.post<any[]>(`ruteo/visita/rutear/`, "");
  }

  eliminarGuia(id: number) {
    return this.http.delete(`ruteo/visita/${id}/`, {});
  }

  eliminarTodosLasGuias() {
    return this.http.post("ruteo/visita/eliminar-todos/", {});
  }

  importarComplementos(parametros: {
    numeroRegistros: number;
    desde: number;
    hasta: number;
    pendienteDespacho: boolean
  }) {
    return this.http.post(`ruteo/visita/importar-complemento/`, {
      limite: parametros.numeroRegistros,
      guia_desde: parametros.desde,
      guia_hasta: parametros.hasta,
      pendiente_despacho: parametros.pendienteDespacho
    });
  }
}
