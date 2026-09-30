import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { GeneralApiService } from '../../../../core';

interface DespachoEvento {
  id: number;
  tipo: string;
  tipo_nombre: string;
  usuario_id: number | null;
  usuario_nombre: string | null;
  fecha: string;
  detalle: string | null;
}

@Component({
  selector: 'app-despacho-tab-evento',
  standalone: true,
  imports: [CommonModule, FormatFechaPipe],
  templateUrl: './despacho-tab-evento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTabEventoComponent implements OnInit {
  @Input() despachoId!: number;

  private _generalApiService = inject(GeneralApiService);

  eventos = signal<DespachoEvento[]>([]);
  cargando = signal<boolean>(false);

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    if (!this.despachoId) return;
    this.cargando.set(true);
    this._generalApiService
      .consultaApi<DespachoEvento[]>('ruteo/despacho/eventos/', {
        despacho_id: this.despachoId.toString(),
      })
      .subscribe({
        next: (respuesta) => {
          this.eventos.set(respuesta ?? []);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  color(tipo: string): string {
    if (tipo === 'anulado' || tipo === 'soltado') return 'bg-red-500';
    if (tipo === 'aprobado' || tipo === 'tomado' || tipo === 'terminado') {
      return 'bg-green-500';
    }
    return 'bg-blue-500';
  }
}
