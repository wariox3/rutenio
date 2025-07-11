import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VisitaService {
  constructor() {}

  private actualizarListaSubject = new Subject<void>();

  actualizarLista$ = this.actualizarListaSubject.asObservable();

  notificarActualizacionLista() {
    this.actualizarListaSubject.next();
  }
}
