import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FiltroBaseComponent } from '../../../../common/components/filtros/filtro-base/filtro-base.component';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { Observable, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NovedadService } from '../../servicios/novedad.service';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { FormControl, FormGroup } from '@angular/forms';
import { despachoMapeo } from '../../../visita/mapeos/despacho-mapeo';
import { novedadMapeo } from '../../mapeos/novedad-mapeo';
import { mapeo } from '../../../../common/mapeos/documentos';
import { ButtonComponent } from "../../../../common/components/ui/button/button.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-novedad-lista',
  standalone: true,
  imports: [FiltroBaseComponent, TablaComunComponent, CommonModule, ButtonComponent, RouterLink],
  templateUrl: './novedad-lista.component.html',
  styleUrl: './novedad-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NovedadListaComponent extends General implements OnInit {
  private _novedadService = inject(NovedadService);
  private _filtroBaseService = inject(FiltroBaseService);

  public novedades$: Observable<any[]>;
  public mapeoDocumento = mapeo;
  public mapeoFiltros = novedadMapeo;
  public nombreFiltro = '';

  public arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: ['-fecha'],
    limite_conteo: 10000,
    modelo: 'RutNovedad',
  };

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    estado_aprobado: new FormControl('todos'),
  });

  ngOnInit(): void {
    this._construirFiltros();
    this.consultaLista(this.arrParametrosConsulta);
  }

  private _construirFiltros() {
    this.nombreFiltro = this._filtroBaseService.construirFiltroKey();
    const filtroGuardado = localStorage.getItem(this.nombreFiltro);
    if (filtroGuardado !== null) {
      const filtros = JSON.parse(filtroGuardado);
      this.arrParametrosConsulta.filtros = [...filtros];
    }
  }

  consultaLista(filtros: any) {
    this.novedades$ = this._novedadService.lista(filtros).pipe(
      switchMap((response) => {
        return of(response.registros);
      })
    );
  }

  filtrosPersonalizados(filtros: any) {
    if (filtros.length >= 1) {
      this.arrParametrosConsulta.filtros = filtros;
    } else {
      this.arrParametrosConsulta.filtros = [];
    }

    this.consultaLista(this.arrParametrosConsulta);
  }

  limpiarFiltros() {
    this.consultaLista(this.arrParametrosConsulta);
    this.formularioFiltros.patchValue({
      id: '',
    });
  }

  aplicarFiltros() {
    const estadoAprobado = this.formularioFiltros.get('estado_aprobado').value;
    const estadoTerminado =
      this.formularioFiltros.get('estado_terminado').value;

    let parametrosConsulta: ParametrosConsulta = {
      ...this.arrParametrosConsulta,
      filtros: [
        ...this.arrParametrosConsulta.filtros,
        {
          operador: 'icontains',
          propiedad: 'id',
          valor1: this.formularioFiltros.get('id').value,
        },
        {
          operador: 'icontains',
          propiedad: 'vehiculo__placa',
          valor1: this.formularioFiltros.get('vehiculo__placa').value,
        },
        ...(estadoAprobado !== 'todos'
          ? [
              {
                operador: '',
                propiedad: 'estado_aprobado',
                valor1: estadoAprobado === 'si',
              },
            ]
          : []),
        ...(estadoTerminado && estadoTerminado !== 'todos'
          ? [
              {
                operador: '',
                propiedad: 'estado_terminado',
                valor1: estadoTerminado === 'si',
              },
            ]
          : []),
      ],
    };

    this.consultaLista(parametrosConsulta);
  }

  detalleNovedad(id: number) {
    this.router.navigateByUrl(`/movimiento/novedad/detalle/${id}`);
  }
}
