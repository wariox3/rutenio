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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VisitaService } from '../../servicios/visita.service';

@Component({
  selector: 'app-visita-editar-rutear',
  standalone: true,
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './visita-editar-rutear.component.html',
  styleUrl: './visita-editar-rutear.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaEditarRutearComponent extends General implements OnInit {
  private visitaService = inject(VisitaService);

  @Input() visita;
  @Output() emitirCerrarModal = new EventEmitter<void>()

  public formularioVisitaRutear = new FormGroup({
    documento: new FormControl(''),
    destinatario: new FormControl(''),
    destinatario_direccion: new FormControl(''),
    destinatario_telefono: new FormControl(''),
    destinatario_correo: new FormControl(''),
    peso: new FormControl(''),
    volumen: new FormControl(''),
    latitud: new FormControl(''),
    longitud: new FormControl(''),
  });

  ngOnInit(): void {
    this.formularioVisitaRutear.patchValue({
      documento: this.visita.documento,
      destinatario: this.visita.destinatario,
      destinatario_direccion: this.visita.destinatario_direccion,
      destinatario_correo: this.visita.destinatario_correo,
      destinatario_telefono: this.visita.destinatario_telefono,
      peso: this.visita.peso,
      volumen: this.visita.volumen,
      latitud: this.visita.latitud,
      longitud: this.visita.longitud,
    });
  }

  enviar() {
    this.visitaService
      .actualizarDatosVisita(this.visita.id, this.formularioVisitaRutear.value)
      .subscribe((respuesta: any) => {
        this.alerta.mensajaExitoso('Se ha actualizado la visita exitosamente.');
        this.emitirCerrarModal.emit()
      });
  }

}
