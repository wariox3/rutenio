import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { UbicacionService } from '../../../ubicacion/servicios/ubicacion.service';
import { Ubicacion } from '../../../../interfaces/ubicacion/ubicacion.interface';
import { CommonModule } from '@angular/common';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';

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
  
    private ubicacionService = inject(UbicacionService)
  
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
      
      this.ubicacionService.generalLista(parametros).subscribe({
        next: (respuesta) => {
          this.ubicaciones.set(respuesta.registros);
        },
        error: (error) => {
          console.error('Error al cargar visitas:', error);
        }
      });
    }

 }
