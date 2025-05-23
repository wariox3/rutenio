import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { GeneralApiService } from '../../../../core';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { Ubicacion } from '../../../../interfaces/ubicacion/ubicacion.interface';

@Component({
  selector: 'app-despacho-tab-ubicacion',
  standalone: true,
  imports: [CommonModule, FormatFechaPipe],
  templateUrl: './despacho-tab-ubicacion.component.html',
  styleUrl: './despacho-tab-ubicacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTabUbicacionComponent extends General implements OnInit {

    @Input() despachoId: number;
  
    private _generalApiService = inject(GeneralApiService)
  
    ubicaciones = signal<Ubicacion[]>([])
  
    private baseParametrosConsulta: Omit<ParametrosConsulta, 'filtros'> = {
      limite: 50,
      desplazar: 0,
      ordenamientos: ['-fecha'],
      limite_conteo: 10000,
      modelo: 'RutUbicacion',
    };
  
    ngOnInit(): void {
      this.consultarUbicacionesPorDespacho();
    }
  
    private getParametrosConsulta(): ParametrosConsulta {
      return {
        ...this.baseParametrosConsulta,
        filtros: [{ propiedad: 'despacho_id', valor1: this.despachoId.toString() }]
      };
    }
  
    consultarUbicacionesPorDespacho() {
      if (!this.despachoId) return;
      
      const parametros = this.getParametrosConsulta();
      
      this._generalApiService.getLista<Ubicacion[]>(parametros).subscribe({
        next: (respuesta) => {
          this.ubicaciones.set(respuesta.registros);
        },
        error: (error) => {
          console.error('Error al cargar visitas:', error);
        }
      });
    }

 }
