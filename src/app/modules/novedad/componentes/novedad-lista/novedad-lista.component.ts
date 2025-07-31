import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { ButtonComponent } from "../../../../common/components/ui/button/button.component";
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/documentos';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { NovedadService } from '../../servicios/novedad.service';
import { FiltroComponent } from "../../../../common/components/ui/filtro/filtro.component";
import { NOVEDAD_FILTERS } from '../../mapeos/novedad-mapeo';
import { ParametrosApi } from '../../../../core/types/api.type';

@Component({
  selector: 'app-novedad-lista',
  standalone: true,
  imports: [TablaComunComponent, CommonModule, ButtonComponent, RouterLink, FiltroComponent],
  templateUrl: './novedad-lista.component.html',
  styleUrl: './novedad-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NovedadListaComponent extends General implements OnInit {
  private _novedadService = inject(NovedadService);
  private _filtroBaseService = inject(FiltroBaseService);

  public novedades$: Observable<any[]>;
  public mapeoDocumento = mapeo;
  public mapeoFiltros = NOVEDAD_FILTERS;
  public nombreFiltro = '';
  public filtroKey = signal<string>('');

  public arrParametrosConsulta: ParametrosApi = {
    limit: 50,
    ordering: '-fecha',
  };

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    estado_aprobado: new FormControl('todos'),
  });

  ngOnInit(): void {
    this.consultaLista(this.arrParametrosConsulta);
    this.filtroKey.set(
      'novedad_lista_filtro'
    );
  }

  consultaLista(filtros: any) {
    this.novedades$ = this._novedadService.lista(filtros).pipe(
      switchMap((response) => {
        return of(response.results);
      })
    );
  }

  limpiarFiltros() {
    this.consultaLista(this.arrParametrosConsulta);
    this.formularioFiltros.patchValue({
      id: '',
    });
  }

  detalleNovedad(id: number) {
    this.router.navigateByUrl(`/movimiento/novedad/detalle/${id}`);
  }

  filterChange(filters: Record<string, any>) {
    this.consultaLista({
      ...this.arrParametrosConsulta,
      ...filters,
    })
  }
}
