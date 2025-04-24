import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { ContactoService } from '../../servicios/contacto.service';
import ContactoFormularioComponent from '../contacto-formulario/contacto-formulario.component';

@Component({
  selector: 'app-contacto-nuevo',
  standalone: true,
  imports: [CommonModule, ContactoFormularioComponent],
  templateUrl: `./contacto-nuevo.component.html`,
  styleUrl: './contacto-nuevo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoNuevoComponent extends General {
  private _contactoService = inject(ContactoService);

  constructor() {
    super();
  }

  enviarFormulario(formulario: any) {
    this._contactoService
      .guardarContacto(formulario)
      .subscribe((respuesta: any) => {
        this.alerta.mensajaExitoso('Se ha creado el vehículo exitosamente.');
        this.router.navigate(['/administracion/contacto/lista']);
      });
  }
}
