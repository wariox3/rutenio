import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/documentos';
import { DespachoService } from '../../servicios/despacho.service';
import { FiltroBaseComponent } from '../../../../common/components/filtros/filtro-base/filtro-base.component';
import { FormControl, FormGroup } from '@angular/forms';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { despachoMapeo } from '../../../visita/mapeos/despacho-mapeo';

@Component({
  selector: 'app-despacho-lista',
  standalone: true,
  imports: [CommonModule, TablaComunComponent, FiltroBaseComponent],
  templateUrl: './despacho-lista.component.html',
  styleUrl: './despacho-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DespachoListaComponent extends General implements OnInit {
  private _despachoService = inject(DespachoService);
  private _filtroBaseService = inject(FiltroBaseService);

  public mapeoDocumento = mapeo;
  public mapeoFiltros = despachoMapeo;
  public nombreFiltro = '';
  public despachos$: Observable<any[]>;
  public arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: ['-fecha'],
    limite_conteo: 10000,
    modelo: 'RutDespacho',
  };

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    guia: new FormControl(''),
    estado_decodificado: new FormControl('todos'),
  });

  ngOnInit() {
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
    this.despachos$ = this._despachoService.lista(filtros).pipe(
      switchMap((response) => {
        return of(response.registros);
      })
    );
  }

  detalleDespacho(id: number) {
    this.router.navigateByUrl(`/movimiento/despacho/detalle/${id}`);
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
      guia: '',
      estado_decodificado: 'todos',
    });
  }

  aplicarFiltros() {
    const estadoAprobado = this.formularioFiltros.get('estado_aprobado').value;
    const estadoTerminado =
      this.formularioFiltros.get('estado_terminado').value; // Asumo que existe

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
}
