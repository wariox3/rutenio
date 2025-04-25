import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DespachoService } from '../../servicios/despacho.service';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { FiltroBaseComponent } from '../../../../common/components/filtros/filtro-base/filtro-base.component';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { guiaMapeo } from '../../../visita/mapeos/guia-mapeo';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-despacho-adicionar-visita',
  standalone: true,
  imports: [FormsModule, CommonModule, FiltroBaseComponent],
  templateUrl: './despacho-adicionar-visita.component.html',
  styleUrl: './despacho-adicionar-visita.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaAdicionarComponent extends General implements OnInit {
  private _despachoService = inject(DespachoService);
  private _visitaService = inject(VisitaService);
  private _filtroBaseService = inject(FiltroBaseService)

  public nombreFiltro = '';
  public mapeoFiltros = guiaMapeo;
  public visitasPendientes$: Observable<any[]>;

  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [{ propiedad: 'estado_despachado', valor1: false }],
    limite: 50,
    desplazar: 0,
    ordenamientos: ['id'],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    guia: new FormControl(''),
    estado_decodificado: new FormControl('todos'),
  });

  ngOnInit(): void {
    this._construirFiltros();
    this.consultaLista(this.arrParametrosConsulta);
    this.changeDetectorRef.detectChanges();
  }

  private _construirFiltros() {
    this.nombreFiltro = this._filtroBaseService.construirFiltroKey();
    const filtroGuardado = localStorage.getItem(this.nombreFiltro);
    if (filtroGuardado !== null) {
      const filtros = JSON.parse(filtroGuardado);
      this.arrParametrosConsulta.filtros = [...filtros];
    }
  }

  filtrosPersonalizados(filtros: any) {
    if (filtros.length >= 1) {
      this.arrParametrosConsulta.filtros = filtros;
    } else {
      this.arrParametrosConsulta.filtros = [];
    }

    this.consultaLista(this.arrParametrosConsulta);
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
          operador: '',
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

  consultaLista(filtros: any) {
    this.visitasPendientes$ = this._despachoService.lista(filtros).pipe(
      switchMap((response) => {
        return of(response.registros);
      })
    );
  }
}
