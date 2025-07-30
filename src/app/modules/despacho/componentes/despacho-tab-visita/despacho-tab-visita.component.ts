import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { ValidarBooleanoPipe } from '../../../../common/pipes/validar_booleano';
import { GeneralApiService } from '../../../../core';
import { Visita } from '../../../visita/interfaces/visita.interface';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';

@Component({
  selector: 'app-despacho-tab-visita',
  standalone: true,
  imports: [CommonModule, ValidarBooleanoPipe, FormatFechaPipe],
  templateUrl: './despacho-tab-visita.component.html',
  styleUrl: './despacho-tab-visita.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTabVisitaComponent extends General implements OnInit, OnDestroy {

  @Input() despachoId: number;
  private _destroy$ = new Subject<void>()
  private visitaService = inject(VisitaService)
  private _generalApiService = inject(GeneralApiService)

  visitas = signal<Visita[]>([])

  private baseParametrosConsulta: ParametrosApi= {
    limit: 100,
    ordering: 'orden',
    serializador: 'trafico'
  };

  ngOnInit(): void {
    this.visitaService.actualizarLista$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.consultarVisitaPorDespacho();
    })
    this.consultarVisitaPorDespacho();
  }

  private getParametrosConsulta(): ParametrosApi {
    return {
      ...this.baseParametrosConsulta,
      'despacho_id' : this.despachoId.toString()
    };
  }

  consultarVisitaPorDespacho() {
    if (!this.despachoId) return;
    
    const parametros = this.getParametrosConsulta();
    
    this._generalApiService.consultaApi<RespuestaApi<Visita>>('ruteo/visita/', parametros).subscribe({
      next: (respuesta) => {
        this.visitas.set(respuesta.results);
      },
      error: (error) => {
        console.error('Error al cargar visitas:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.unsubscribe();
  }

 }
