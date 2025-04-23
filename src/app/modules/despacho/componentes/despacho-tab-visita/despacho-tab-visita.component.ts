import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { Visita } from '../../../visita/interfaces/visita.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { CommonModule } from '@angular/common';
import { ValidarBooleanoPipe } from '../../../../common/pipes/validar_booleano';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { Subject, takeUntil } from 'rxjs';

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

  visitas = signal<Visita[]>([])

  private baseParametrosConsulta: Omit<ParametrosConsulta, 'filtros'> = {
    limite: 50,
    desplazar: 0,
    ordenamientos: ['orden'],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  ngOnInit(): void {
    this.visitaService.actualizarLista$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.consultarVisitaPorDespacho();
    })
    this.consultarVisitaPorDespacho();
  }

  private getParametrosConsulta(): ParametrosConsulta {
    return {
      ...this.baseParametrosConsulta,
      filtros: [{ propiedad: 'despacho_id', valor1: this.despachoId.toString() }]
    };
  }

  consultarVisitaPorDespacho() {
    if (!this.despachoId) return;
    
    const parametros = this.getParametrosConsulta();
    
    this.visitaService.generalLista(parametros).subscribe({
      next: (respuesta) => {
        this.visitas.set(respuesta.registros);
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
