import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { GeneralApiService } from '../../../../core';
import { ParametrosApi, RespuestaApi } from '../../../../core/types/api.type';
import { Ubicacion } from '../../../../interfaces/ubicacion/ubicacion.interface';
import { PaginadorComponent } from "../../../../common/components/ui/paginacion/paginador/paginador.component";

@Component({
  selector: 'app-despacho-tab-ubicacion',
  standalone: true,
  imports: [CommonModule, FormatFechaPipe, PaginadorComponent],
  templateUrl: './despacho-tab-ubicacion.component.html',
  styleUrl: './despacho-tab-ubicacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTabUbicacionComponent extends General implements OnInit {

  @Input() despachoId: number;

  private _destroy$ = new Subject<void>()
  private _generalApiService = inject(GeneralApiService)
  public currentPage = signal(1);
  public totalPages = signal(1);
  public totalItems: number = 0;
  public cantidadRegistros: number = 0;
  ubicaciones = signal<Ubicacion[]>([])

  private baseParametrosConsulta: ParametrosApi = {
    limit: 100,
    ordering: '-fecha',
    serializador: 'trafico'
  };

  ngOnInit(): void {
    this.consultarUbicacionesPorDespacho();
  }

  private getParametrosConsulta(): ParametrosApi {
    return {
      ...this.baseParametrosConsulta,
      'despacho_id': this.despachoId.toString()
    };
  }

  consultarUbicacionesPorDespacho() {
    if (!this.despachoId) return;

    const parametros = this.getParametrosConsulta();

    this._generalApiService.consultaApi<RespuestaApi<Ubicacion>>('ruteo/ubicacion/', parametros).subscribe({
      next: (respuesta) => {
        this.ubicaciones.set(respuesta.results);
        this.cantidadRegistros = respuesta.count;
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

  onPageChange(page: number): void {
    const parametros = this.getParametrosConsulta();

    this._generalApiService.consultaApi<RespuestaApi<Ubicacion>>('ruteo/ubicacion/', {
      ...parametros,
      page
    }).subscribe({
        next: (respuesta) => {
          this.ubicaciones.set(respuesta.results);
        },
          error: (error) => {
            console.error('Error al cargar visitas:', error);
          }
    });
  }

 }
