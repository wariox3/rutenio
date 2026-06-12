import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VisitaApiService } from '../../../visita/servicios/visita-api.service';
import { SincronizacionComplementoComponent } from '../sincronizacion-complemento/sincronizacion-complemento.component';
import { SincronizacionComplementoConfig } from '../../interfaces/sincronizacion-complemento.interface';

@Component({
  selector: 'app-enviar-entrega-complemento',
  standalone: true,
  imports: [SincronizacionComplementoComponent],
  template: '<app-sincronizacion-complemento [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EnviarEntregaComplementoComponent {
  private readonly _visitaApiService = inject(VisitaApiService);

  config: SincronizacionComplementoConfig = {
    titulo: 'Enviar entrega complemento',
    descripcion:
      'Reenvía a Complemento las entregas confirmadas que aún no se han sincronizado. El proceso descarga las evidencias de cada visita y avanza en lotes hasta terminar.',
    unidad: 'entregas',
    obtenerResumen: () =>
      this._visitaApiService.obtenerResumenEntregaComplemento(),
    sincronizar: (reiniciarDescartadas) =>
      this._visitaApiService.enviarEntregaComplemento(reiniciarDescartadas),
  };
}
