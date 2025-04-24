import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { LabelComponent } from "../../../../common/components/ui/form/label/label.component";
import { InputTextareaComponent } from "../../../../common/components/ui/form/input-textarea/input-textarea.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from "../../../../common/components/ui/button/button.component";
import { NovedadService } from '../../servicios/novedad.service';
import { AlertaService } from '../../../../common/services/alerta.service';

@Component({
  selector: 'app-novedad-solucion',
  standalone: true,
  imports: [LabelComponent, InputTextareaComponent, CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './novedad-solucion.component.html',
  styleUrl: './novedad-solucion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovedadSolucionComponent extends General implements OnInit { 

  @Input() novedadId: number;
  @Output() emitirNovedadSolucion: EventEmitter<any> = new EventEmitter();

  private _novedadService = inject(NovedadService);
  private _alertaService = inject(AlertaService);

  public formularioNovedad = new FormGroup({
    id: new FormControl(''),
    solucion: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    if (this.novedadId) {
      this.formularioNovedad.patchValue({
        id: this.novedadId.toString()
      });
    }
  }
  
  solucion(){
    this._novedadService.solucionarNovedad(this.formularioNovedad.value).subscribe(() => {
      this._novedadService.notificarActualizacionLista();
      this._alertaService.mensajaExitoso(
        'Se ha solucionado la novedad.'
      );
      this.emitirNovedadSolucion.emit();
    })
  }

}
