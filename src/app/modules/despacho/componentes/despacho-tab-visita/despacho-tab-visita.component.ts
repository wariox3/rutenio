import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { VisitaService } from '../../../visita/servicios/visita.service';
import { Visita } from '../../../visita/interfaces/visita.interface';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { CommonModule } from '@angular/common';
import { ValidarBooleanoPipe } from '../../../../common/pipes/validar_booleano';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';

@Component({
  selector: 'app-despacho-tab-visita',
  standalone: true,
  imports: [CommonModule, ValidarBooleanoPipe, FormatFechaPipe],
  templateUrl: './despacho-tab-visita.component.html',
  styleUrl: './despacho-tab-visita.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTabVisitaComponent extends General implements OnInit {

  @Input() despachoId: number;

  private visitaService = inject(VisitaService)

  visitas = signal<Visita[]>([])

  private baseParametrosConsulta: Omit<ParametrosConsulta, 'filtros'> = {
    limite: 50,
    desplazar: 0,
    ordenamientos: ['id'],
    limite_conteo: 10000,
    modelo: 'RutVisita',
  };

  ngOnInit(): void {
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

 }
