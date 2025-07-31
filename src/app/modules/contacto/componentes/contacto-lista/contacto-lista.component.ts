import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';
import { mapeo } from '../../../../common/mapeos/administradores';
import { ParametrosApi } from '../../../../core/types/api.type';
import { RespuestaContacto } from '../../../../interfaces/contacto/contacto.interface';
import { ContactoService } from '../../servicios/contacto.service';
import { GeneralService } from '../../../../common/services/general.service';

@Component({
  selector: 'app-contacto-lista',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterLink, TablaComunComponent],
  templateUrl: './contacto-lista.component.html',
  styleUrl: './contacto-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoListaComponent extends General implements OnInit {
  arrParametrosConsulta: ParametrosApi = {
    limit: 50,
  };
  cantidad_registros!: number;
  arrContactos: RespuestaContacto[];
  encabezados: any[];
  public mapeoAdministrador = mapeo;

  private contactoService = inject(ContactoService);
  private _generalService = inject(GeneralService);

  ngOnInit(): void {
    this.consultarLista();
    this.encabezados = mapeo.Contacto.datos
      .filter((dato) => dato.visibleTabla === true)
      .map((dato) => dato.nombre);
  }

  consultarLista() {
    this._generalService
      .consultaApi('general/contacto/', this.arrParametrosConsulta)
      .subscribe((respuesta: any) => {
        this.cantidad_registros = respuesta.count;
        this.arrContactos = respuesta.results;
        this.changeDetectorRef.detectChanges();
      });
  }

  editarContacto(id: number) {
    this.router.navigateByUrl(`/administracion/contacto/editar/${id}`);
  }

  detalleContacto(id: number) {
    this.router.navigateByUrl(`/administracion/contacto/detalle/${id}`);
  }
}
