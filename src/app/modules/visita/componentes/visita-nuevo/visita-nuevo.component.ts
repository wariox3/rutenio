import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { VisitaApiService } from '../../servicios/visita-api.service';
import VisitaFormularioComponent from '../visita-formulario/visita-formulario.component';

@Component({
  selector: 'app-visita-nuevo',
  standalone: true,
  imports: [CommonModule, VisitaFormularioComponent],
  templateUrl: './visita-nuevo.component.html',
  styleUrl: './visita-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaNuevoComponent extends General implements OnInit {
  private _visitaApiService = inject(VisitaApiService);

  informacionVisita: any = {
    numero: '',
    documento: '',
    destinatario: '',
    destinatario_direccion: '',
    peso: '',
    volumen: '',
    tiempo_servicio: '',
  };

  ngOnInit() {}

  enviarFormulario(formulario: any) {
    this._visitaApiService.guardar(formulario).subscribe(() => {
      this.alerta.mensajaExitoso('Se ha creado el contacto exitosamente.');
      this.router.navigate(['/movimiento/visita/lista']);
    });
  }
}
