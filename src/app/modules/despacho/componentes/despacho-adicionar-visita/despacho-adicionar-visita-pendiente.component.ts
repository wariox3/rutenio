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
import { GeneralApiService } from '../../../../core';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { Visita } from '../../../visita/interfaces/visita.interface';
import { DESPACHO_ADICIONAR_VISITA_PENDIENTE_FILTERS } from '../../mapeos/despacho-adicionar-visita-pendiente.mapeo';
import { DespachoApiService } from '../../servicios/despacho-api.service';
import { FiltroComponent } from "../../../../common/components/ui/filtro/filtro.component";

@Component({
  selector: 'app-despacho-adicionar-visita-pendiente',
  standalone: true,
  imports: [FormsModule, CommonModule, FiltroComponent],
  templateUrl: './despacho-adicionar-visita-pendiente.component.html',
  styleUrl: './despacho-adicionar-visita-pendiente.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaAdicionarPendienteComponent extends General implements OnInit {
  @Input() despachoId: number;
  private _despachoApiService = inject(DespachoApiService);
  private _generalApiService = inject(GeneralApiService);

  public nombreFiltro = '';
  public mapeoFiltros = DESPACHO_ADICIONAR_VISITA_PENDIENTE_FILTERS;
  public visitasPendientes$: Observable<any[]>;
  public procesando: number | null = null;

  arrParametrosConsulta: ParametrosApi = {
    estado_despacho: 'False',
    limit: 20,
    ordenamientos: 'id',
  };

  public formularioFiltros = new FormGroup({
    id: new FormControl(''),
    numero: new FormControl(''),
    destinatario: new FormControl(''),
    documento: new FormControl(''),
  });

  ngOnInit(): void {
    this.consultaLista(this.arrParametrosConsulta);
    this.changeDetectorRef.detectChanges();
  }


  aplicarFiltros() {
    // // Filtro base que siempre debe aplicarse
    // const filtroBase = { propiedad: 'estado_despacho', valor1: false };

    // // Filtros del formulario
    // const filtrosFormulario = [
    //   {
    //     operador: '',
    //     propiedad: 'id',
    //     valor1: this.formularioFiltros.get('id').value,
    //   },
    //   {
    //     operador: 'numero',
    //     propiedad: 'numero',
    //     valor1: this.formularioFiltros.get('numero').value,
    //   },
    //   {
    //     operador: 'icontains',
    //     propiedad: 'destinatario',
    //     valor1: this.formularioFiltros.get('destinatario').value,
    //   },
    //   {
    //     operador: 'icontains',
    //     propiedad: 'documento',
    //     valor1: this.formularioFiltros.get('documento').value,
    //   },
    // ].filter((filtro) => filtro.valor1 !== '' && filtro.valor1 !== null); // Filtrar los vacíos

    // let parametrosConsulta: ParametrosConsulta = {
    //   ...this.arrParametrosConsulta,
    //   filtros: [filtroBase, ...filtrosFormulario],
    // };

    // this.consultaLista(parametrosConsulta);
  }

  filterChange(filters: Record<string, any>) {
    this.visitasPendientes$ = this._generalApiService
      .consultaApi<RespuestaApi<Visita>>('ruteo/visita/', {
        ...this.arrParametrosConsulta,
        ...filters,
      }).pipe(
        switchMap((response) => {
          return of(response.results);
        })
      );
  }


  consultaLista(filtros: any) {
    this.visitasPendientes$ = this._generalApiService.consultaApi<RespuestaApi<Visita>>('ruteo/visita/', filtros).pipe(
      switchMap((response) => {
        return of(response.results);
      })
    );
  }

  seleccionarVisita(visitaId: number) {
    this.procesando = visitaId;

    this._despachoApiService.adicionarVisita({
      id: this.despachoId,
      visita_id: visitaId,
    }).subscribe({
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
