import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { NovedadService } from '../../servicios/novedad.service';
import NovedadFormularioComponent from "../novedad-formulario/novedad-formulario.component";

@Component({
  selector: 'app-novedad-nuevo',
  standalone: true,
  imports: [
    CommonModule,
    NovedadFormularioComponent
],
  templateUrl: './novedad-nuevo.component.html',
  styleUrl: './novedad-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NovedadNuevoComponent extends General implements OnInit {

  private novedadService = inject(NovedadService);

  informacionNovedad: any = {
    fecha: '',
    descripcion: '',
    tipo: '',
    visita: '',
    solucion: '',
    estado_solucion: false
  };

  ngOnInit() {}

  enviarFormulario(formulario: any) {
    this.novedadService.guardarNovedad(formulario).subscribe((respuesta: any) => {
      this.alerta.mensajaExitoso('Se ha creado el contacto exitosamente.')
      this.router.navigate(['/movimiento/novedad/lista']);
    });
  }

 }
