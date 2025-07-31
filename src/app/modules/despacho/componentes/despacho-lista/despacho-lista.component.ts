import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/documentos';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { despachoMapeo } from '../../../visita/mapeos/despacho-mapeo';
import { DespachoApiService } from '../../servicios/despacho-api.service';
import { FiltroComponent } from "../../../../common/components/ui/filtro/filtro.component";
import { DESPACHO_LISTA_FILTERS } from '../../mapeos/despacho-lista-mapeo';
import { ParametrosApi } from '../../../../core/types/api.type';
import { PaginadorComponent } from "../../../../common/components/ui/paginacion/paginador/paginador.component";

@Component({
  selector: 'app-despacho-lista',
  standalone: true,
  imports: [CommonModule, TablaComunComponent, FiltroComponent, PaginadorComponent],
  templateUrl: './despacho-lista.component.html',
  styleUrl: './despacho-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoListaComponent extends General implements OnInit {
  private _despachoApiService = inject(DespachoApiService);
  private _filtroBaseService = inject(FiltroBaseService);

  public DESPACHO_LISTA_FILTERS = DESPACHO_LISTA_FILTERS
  public mapeoDocumento = mapeo;
  public mapeoFiltros = despachoMapeo;
  public nombreFiltro = '';
  public despachos$: Observable<any[]>;
  public arrParametrosConsulta: ParametrosApi = {
    limit: 50,
    ordering: '-fecha',
  };
  public filtroKey = signal<string>('');
  public currentPage = signal(1);
  public totalPages = signal(1);
  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    guia: new FormControl(''),
    estado_decodificado: new FormControl('todos'),
  });
  public cantidadRegistros: number = 0;

  ngOnInit() {
    this.filtroKey.set(
      'despacho_lista_filtro'
    );
    this.consultaLista(this.arrParametrosConsulta);
  }

  consultaLista(filtros: any) {
    this.despachos$ = this._despachoApiService.lista(filtros).pipe(
      switchMap((response) => {
        this.cantidadRegistros = response.count;
        return of(response.results);
      })
    );
  }

  detalleDespacho(id: number) {
    this.router.navigateByUrl(`/movimiento/despacho/detalle/${id}`);
  }

  navegarDespachoEditar(id: number) {
    this.router.navigateByUrl(`/movimiento/despacho/editar/${id}`);
  }

  limpiarFiltros() {
    this.consultaLista(this.arrParametrosConsulta);
    this.formularioFiltros.patchValue({
      id: '',
      guia: '',
      estado_decodificado: 'todos',
    });
  }

  filterChange(filters: Record<string, any>) {
    this.consultaLista({
      ...this.arrParametrosConsulta,
      ...filters
    });
  }

  onPageChange(page: number): void {
    console.log(page);

    this.consultaLista({
      ...this.arrParametrosConsulta,
      page
    });
  }
}
