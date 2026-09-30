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
import { despachoMapeo } from '../../../visita/mapeos/despacho-mapeo';
import { DespachoApiService } from '../../servicios/despacho-api.service';
import { DESPACHO_LISTA_FILTERS } from '../../mapeos/despacho-lista-mapeo';
import { ParametrosApi } from '../../../../core/types/api.type';
import { PaginadorComponent } from "../../../../common/components/ui/paginacion/paginador/paginador.component";
import { EstadoOpcion, FiltroSimpleComponent } from '../../../../common/components/ui/filtro-simple/filtro-simple.component';

@Component({
  selector: 'app-despacho-lista',
  standalone: true,
  imports: [CommonModule, TablaComunComponent, FiltroSimpleComponent, PaginadorComponent],
  templateUrl: './despacho-lista.component.html',
  styleUrl: './despacho-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoListaComponent extends General implements OnInit {
  private _despachoApiService = inject(DespachoApiService);

  public DESPACHO_LISTA_FILTERS = DESPACHO_LISTA_FILTERS

  public readonly estadosDespacho: EstadoOpcion[] = [
    { label: 'Todos', params: {} },
    { label: 'Aprobados', params: { estado_aprobado: 'true' } },
    { label: 'Terminados', params: { estado_terminado: 'true' } },
    { label: 'Anulados', params: { estado_anulado: 'true' } },
    { label: 'Sin asignar', params: { conductor_id__isnull: 'true' } },
  ];
  public mapeoDocumento = mapeo;
  public mapeoFiltros = despachoMapeo;
  public nombreFiltro = '';
  public despachos$: Observable<any[]>;
  public filtroKey = signal<string>('');
  public currentPage = signal(1);
  public totalPages = signal(1);
  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    guia: new FormControl(''),
    estado_decodificado: new FormControl('todos'),
  });
  public cantidadRegistros: number = 0;

  private readonly arrParametrosBase: ParametrosApi = {
    limit: 50,
    ordering: '-fecha',
  };
  arrFiltros: Record<string, any> = { page: 1 };

  ngOnInit() {
    // Carga inicial acá (patrón estable). app-filtro-simple re-aplica el filtro
    // guardado de forma diferida por (aplicar) -> filterChange.
    this._consultarLista();
  }

  private _consultarLista(parametrosAdicionales: Record<string, any> = {}): void {
    this.arrFiltros = {
      ...this.arrFiltros,
      ...parametrosAdicionales,
    };

    const parametrosConsulta = {
      ...this.arrParametrosBase,
      ...this.arrFiltros,
    };

    this.despachos$ = this._despachoApiService.lista(parametrosConsulta).pipe(
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
    this.arrFiltros = { page: 1 };
    this._consultarLista();
    this.formularioFiltros.patchValue({
      id: '',
      guia: '',
      estado_decodificado: 'todos',
    });
  }

  filterChange(filters: Record<string, any>) {
    const { ordering, page, ..._ } = this.arrFiltros;
    this.arrFiltros = { page: 1, ...(ordering ? { ordering } : {}), ...filters };
    this._consultarLista();
  }

  onPageChange(page: number): void {
    this._consultarLista({ page });
  }

  onOrdenamientoChange(ordering: string): void {
    if (ordering) {
      this._consultarLista({ ordering });
    } else {
      const { ordering: _, ...filtrosSinOrden } = this.arrFiltros;
      this.arrFiltros = filtrosSinOrden;
      this._consultarLista();
    }
  }
}
