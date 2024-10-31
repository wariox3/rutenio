import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { obtenerContenedorSubdominio } from '../../redux/selectors/contenedor.selector';

export class Subdomino {
  private store = inject(Store);

  urlSubDominio: string;

  constructor() {
    this.store.select(obtenerContenedorSubdominio).subscribe((respuesta) => {
      this.urlSubDominio = environment.url_api_subdominio;
      this.urlSubDominio = this.urlSubDominio.replace('subdominio', respuesta);
    });
  }
}
