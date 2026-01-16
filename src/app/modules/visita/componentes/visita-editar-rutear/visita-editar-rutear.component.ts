import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { LabelComponent } from '../../../../common/components/ui/form/label/label.component';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { InputComponent as InputUiComponent } from '@tamerlantian/ui-components';
import { SoloNumerosDirective } from "../../../../common/directivas/solo-numeros.directive";
import { InputNumericoValidator } from '../../../../common/validaciones/input-numerico.validator';
import { cambiarVacioPorNulo } from '../../../../common/validaciones/campo-no-obligatorio.validator';

@Component({
  selector: 'app-visita-editar-rutear',
  standalone: true,
  imports: [ButtonComponent, ReactiveFormsModule, LabelComponent, InputUiComponent],
  templateUrl: './visita-editar-rutear.component.html',
  styleUrl: './visita-editar-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaEditarRutearComponent extends General implements OnInit {
  private readonly _visitaApiService = inject(VisitaApiService)

  @Input() visita;
  @Output() emitirCerrarModal = new EventEmitter<void>();

  public formularioVisitaRutear = new FormGroup({
    id: new FormControl(''),
    numero: new FormControl('', [cambiarVacioPorNulo.validar]),
    documento: new FormControl(''),
    destinatario: new FormControl('', [Validators.required]),
    destinatario_direccion: new FormControl('', [Validators.required]),
    destinatario_telefono: new FormControl(''),
    destinatario_correo: new FormControl(''),
    unidades: new FormControl('', [Validators.required]),
    peso: new FormControl('', [Validators.required]),
    volumen: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.formularioVisitaRutear.patchValue({
      id: this.visita?.id,
      numero: this.visita?.numero,
      documento: this.visita?.documento,
      destinatario: this.visita?.destinatario,
      destinatario_direccion: this.visita?.destinatario_direccion,
      destinatario_correo: this.visita?.destinatario_correo,
      destinatario_telefono: this.visita?.destinatario_telefono,
      unidades: this.visita?.unidades,
      peso: this.visita?.peso,
      volumen: this.visita?.volumen,
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    InputNumericoValidator.onKeyDown(event);
  }

  enviar() {
    this._visitaApiService
      .actualizarDireccion(this.formularioVisitaRutear.value)
      .subscribe((response) => {
        this.alerta.mensajaExitoso(response.mensaje);
        this.emitirCerrarModal.emit();
      });
  }
}
