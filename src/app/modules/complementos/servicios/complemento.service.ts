import { Injectable } from "@angular/core";
import { HttpService } from "../../../common/services/http.service";

@Injectable({
  providedIn: "root",
})
export class ComplementoService {
  constructor(private http: HttpService) {}

  listarComplementos() {
    return this.http.get<any>(`general/complemento/`);
  }

  instalarComplemento(id: any, data: any) {
    return this.http.put<any>(`general/complemento/${id}/`, data);
  }

  actualizarComplemento(id: any, data: any) {
    return this.http.put<any>(`general/complemento/${id}/`, data);
  }
}
