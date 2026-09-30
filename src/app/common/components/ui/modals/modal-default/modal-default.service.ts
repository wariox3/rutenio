import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalDefaultService {
  private _estaModalBloqueado$: BehaviorSubject<boolean>;

  constructor() {
    this._estaModalBloqueado$ = new BehaviorSubject(false);
  }

  get estado(): Observable<boolean> {
    return this._estaModalBloqueado$.asObservable();
  }

  actualizarEstadoModal(bloquear: boolean) {
    this._estaModalBloqueado$.next(bloquear);
  }

  get estadoModalActual(): boolean {
    return this._estaModalBloqueado$.getValue();
  }
}
