import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { map, Observable, of, switchMap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { FiltroBaseComponent } from '../../../../common/components/filtros/filtro-base/filtro-base.component';
import { FiltroBaseService } from '../../../../common/components/filtros/filtro-base/services/filtro-base.service';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { visitaAdicionarMapeo } from '../../../visita/mapeos/visita-adicionar-mapeo';
import { DespachoApiService } from '../../servicios/despacho-api.service';

@Component({
  selector: 'app-despacho-adicionar-visita-trafico',
  standalone: true,
  imports: [FormsModule, CommonModule, FiltroBaseComponent],
  templateUrl: './despacho-adicionar-visita-trafico.component.html',
  styleUrl: './despacho-adicionar-visita-trafico.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaAdicionarTraficoComponent extends General implements OnInit {
  @Input() despachoId: number;
  private _despachoApiService = inject(DespachoApiService);
  private _filtroBaseService = inject(FiltroBaseService);

  public nombreFiltro = '';
  public mapeoFiltros = visitaAdicionarMapeo;
  public visitasPendientes$: Observable<any[]>;
  public procesando: number | null = null;

  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [
      { propiedad: 'estado_despacho', valor1: true },
      { propiedad: 'estado_entregado', valor1: false },
    ],
    exclusiones: [],
    limite: 20,
    desplazar: 0,
    ordenamientos: ['id'],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    numero: new FormControl(''),
    despacho_id: new FormControl(''),
    destinatario: new FormControl(''),
    documento: new FormControl(''),
  });

  ngOnInit(): void {
    this.arrParametrosConsulta.exclusiones = [
      { propiedad: 'despacho_id', valor1: this.despachoId.toString() },
    ];
    this._construirFiltros();
    this.consultaLista(this.arrParametrosConsulta);
    this.changeDetectorRef.detectChanges();
  }

  private _construirFiltros() {
    this.nombreFiltro = this._filtroBaseService.construirFiltroKey();
    const filtroGuardado = localStorage.getItem(this.nombreFiltro);

    // Filtros base permanentes
    const filtrosBase = [
      { propiedad: 'estado_despacho', valor1: true },
      { propiedad: 'estado_entregado', valor1: false },
    ];

    if (filtroGuardado !== null) {
      const filtros = JSON.parse(filtroGuardado);
      // Combinar filtros base con los del localStorage
      this.arrParametrosConsulta.filtros = [...filtrosBase, ...filtros];
    } else {
      this.arrParametrosConsulta.filtros = [...filtrosBase];
    }
  }

  aplicarFiltros() {
    // Filtros base permanentes
    const filtrosBase = [
      { propiedad: 'estado_despacho', valor1: true },
      { propiedad: 'estado_entregado', valor1: false },
    ];

    // Filtros del formulario con validación de valores
    const filtrosFormulario = [
      {
        operador: '',
        propiedad: 'id',
        valor1: this.formularioFiltros.get('id')?.value || '',
      },
      {
        operador: '',
        propiedad: 'numero',
        valor1: this.formularioFiltros.get('numero')?.value || '',
      },
      {
        operador: '',
        propiedad: 'despacho_id',
        valor1: this.formularioFiltros.get('despacho_id')?.value || '',
      },
      {
        operador: 'icontains',
        propiedad: 'destinatario',
        valor1: this.formularioFiltros.get('destinatario')?.value || '',
      },
      {
        operador: 'icontains',
        propiedad: 'documento',
        valor1: this.formularioFiltros.get('documento')?.value || '',
      },
    ].filter((filtro) => filtro.valor1 !== '' && filtro.valor1 !== null);

    let parametrosConsulta: ParametrosConsulta = {
      ...this.arrParametrosConsulta,
      filtros: [...filtrosBase, ...filtrosFormulario],
      exclusiones: [
        { propiedad: 'despacho_id', valor1: this.despachoId.toString() },
      ],
    };

    this.consultaLista(parametrosConsulta);
  }

  filtrosPersonalizados(filtros: any) {
    // Filtros base permanentes
    const filtrosBase = [
      { propiedad: 'estado_despacho', valor1: true },
      { propiedad: 'estado_entregado', valor1: false },
    ];

    if (filtros.length >= 1) {
      this.arrParametrosConsulta.filtros = [...filtrosBase, ...filtros];
    } else {
      this.arrParametrosConsulta.filtros = [...filtrosBase];
    }

    // Mantener exclusiones
    this.arrParametrosConsulta.exclusiones = [
      { propiedad: 'despacho_id', valor1: this.despachoId.toString() },
    ];

    this.consultaLista(this.arrParametrosConsulta);
  }

  consultaLista(filtros: any) {
    this.visitasPendientes$ = this._despachoApiService.lista(filtros).pipe(
      switchMap((response) => {
        return of(response.registros);
      })
    );
  }

  seleccionarVisita(visitaId: number) {
    this.procesando = visitaId;

    this._despachoApiService
      .adicionarVisita({
        id: this.despachoId,
        visita_id: visitaId,
        trafico: true,
      })
      .subscribe({
        next: (response) => {
          this.alerta.mensajaExitoso(response.mensaje);
          this.procesando = null;

          this.visitasPendientes$ = this.visitasPendientes$.pipe(
            map((visitas) => visitas.filter((v) => v.id !== visitaId))
          );

          this.changeDetectorRef.detectChanges();
        },
      });
  }
}
