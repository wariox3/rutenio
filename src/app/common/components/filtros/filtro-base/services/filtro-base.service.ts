import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FiltroBaseService {
  public myEvent = new Subject<void>();

  constructor() {}

  construirFiltroKey() {
    let key = '';
    let rutaValores = window.location.pathname.split('/');
    
    rutaValores.forEach((valor) => {
      if (valor) {
        key += valor + '_';
      }
    });

    return key;
  }
}
