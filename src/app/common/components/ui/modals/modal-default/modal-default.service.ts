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

  /**
   * Devuelve un observable para monitorear el estado de bloqueo del modal.
   */
  get estado(): Observable<boolean> {
    return this._estaModalBloqueado$.asObservable();
  }

  /**
   * Cambia el estado de bloqueo del modal.
   * @param bloquear Si es `true`, bloquea el modal; si es `false`, lo desbloquea.
   */
  actualizarEstadoModal(bloquear: boolean) {
    this._estaModalBloqueado$.next(bloquear);
  }

  /**
   * Devuelve el estado actual del bloqueo del modal.
   */
  get estadoModalActual(): boolean {
    return this._estaModalBloqueado$.getValue();
  }
}
