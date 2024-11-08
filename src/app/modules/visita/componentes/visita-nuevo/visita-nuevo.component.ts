import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { VisitaService } from '../../servicios/visita.service';
import VisitaFormularioComponent from "../visita-formulario/visita-formulario.component";

@Component({
  selector: 'app-visita-nuevo',
  standalone: true,
  imports: [
    CommonModule,
    VisitaFormularioComponent
],
  templateUrl: './visita-nuevo.component.html',
  styleUrl: './visita-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaNuevoComponent extends General implements OnInit {

  private guiaService = inject(VisitaService);

  informacionVisita: any = {
    fecha: '',
    documento: '',
    destinatario: '',
    destinatario_direccion: '',
    destinatario_correo: '',
    peso: '',
    volumen: '',
    latitud: '',
    longitud: '',
    decodificado: ''
  };

  ngOnInit() {}

  enviarFormulario(formulario: any) {
    this.guiaService.guardarGuias(formulario).subscribe((respuesta: any) => {
      this.alerta.mensajaExitoso('Se ha creado el contacto exitosamente.')
      this.router.navigate(['/admin/visita/lista']);
    });
  }

 }
