import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DespachoApiService } from '../../../despacho/servicios/despacho-api.service';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { finalize } from 'rxjs';
import { AlertaService } from '../../../../common/services/alerta.service';

@Component({
  selector: 'app-nuevo-desde-complemento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LabelComponent,
    InputComponent,
  ],
  templateUrl: './nuevo-desde-complemento.component.html',
  styleUrl: './nuevo-desde-complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoDesdeComplementoComponent {
  @Output() complementoCargado = new EventEmitter<void>();

  private _despachoApiService = inject(DespachoApiService);
  private _alerta = inject(AlertaService);

  public cargando = signal(false);
  public formularioNuevoComplemento = new FormGroup({
    despacho_id: new FormControl('', [Validators.required]),
  });

  nuevoComplemento() {
    this.cargando.set(true);
    this._despachoApiService
      .nuevoComplemento(this.formularioNuevoComplemento.value.despacho_id)
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe((respuesta) => {
        this._alerta.mensajaExitoso(respuesta.mensaje);
        this.complementoCargado.emit();
      });
  }
}
