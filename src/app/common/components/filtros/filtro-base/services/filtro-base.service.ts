import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FiltroBaseService {
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
