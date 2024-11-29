import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { mapeo } from '../../../../common/mapeos/documentos';
import { DespachoService } from '../../servicios/despacho.service';
import { Observable, of, switchMap } from 'rxjs';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';

@Component({
  selector: 'app-despacho-lista',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TablaComunComponent],
  templateUrl: './despacho-lista.component.html',
  styleUrl: './despacho-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoListaComponent extends General implements OnInit {
  private _despachoService = inject(DespachoService);
  public mapeoDocumento = mapeo;
  public despachos$: Observable<any[]>;
  public arrParametrosConsulta: any = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'RutDespacho',
  };

  ngOnInit() {
    this.consultaLista();
  }

  consultaLista() {
    this.despachos$ = this._despachoService
      .lista(this.arrParametrosConsulta)
      .pipe(
        switchMap((response) => {
          return of(response.registros);
        })
      );
  }
}
