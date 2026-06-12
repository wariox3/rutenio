import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NovedadService } from '../../../novedad/servicios/novedad.service';
import { SincronizacionComplementoComponent } from '../sincronizacion-complemento/sincronizacion-complemento.component';
import { SincronizacionComplementoConfig } from '../../interfaces/sincronizacion-complemento.interface';

@Component({
  selector: 'app-enviar-novedad-complemento',
  standalone: true,
  imports: [SincronizacionComplementoComponent],
  template: '<app-sincronizacion-complemento [config]="config" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EnviarNovedadComplementoComponent {
  private readonly _novedadApiService = inject(NovedadService);

  config: SincronizacionComplementoConfig = {
    titulo: 'Enviar novedad complemento',
    descripcion:
      'Reenvía a Complemento las novedades registradas que aún no se han sincronizado. El proceso descarga las evidencias de cada novedad y avanza en lotes hasta terminar.',
    unidad: 'novedades',
    obtenerResumen: () =>
      this._novedadApiService.obtenerResumenNovedadComplemento(),
    sincronizar: (reiniciarDescartadas) =>
      this._novedadApiService.enviarNovedadComplemento(reiniciarDescartadas),
  };
}
