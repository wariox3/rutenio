import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { General } from '../../../../common/clases/general';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VisitaService } from '../../servicios/visita.service';
import { VisitaRutearService } from '../../servicios/visita-rutear.service';
import { ParametrosActualizarDireccion } from '../../../../interfaces/visita/rutear.interface';

@Component({
  selector: 'app-visita-editar-rutear',
  standalone: true,
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './visita-editar-rutear.component.html',
  styleUrl: './visita-editar-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaEditarRutearComponent extends General implements OnInit {
  private readonly _visitaRutearService = inject(VisitaRutearService);
  private visitaService = inject(VisitaService);

  @Input() visita;
  @Output() emitirCerrarModal = new EventEmitter<void>();

  public formularioVisitaRutear = new FormGroup({
    id: new FormControl(''),
    numero: new FormControl(''),
    documento: new FormControl(''),
    destinatario: new FormControl('', [Validators.required]),
    destinatario_direccion: new FormControl('', [Validators.required]),
    destinatario_telefono: new FormControl(''),
    destinatario_correo: new FormControl(''),
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
      peso: this.visita?.peso,
      volumen: this.visita?.volumen,
    });
  }

  enviar() {
    this._visitaRutearService
      .actualizarDireccion(this.formularioVisitaRutear.value)
      .subscribe((response) => {
        this.alerta.mensajaExitoso(response.mensaje);
        this.emitirCerrarModal.emit();
      });
  }
}
