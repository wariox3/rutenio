import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { RouterLink } from '@angular/router';
import { General } from '../../../../common/clases/general';
import { ParametrosConsulta } from '../../../../interfaces/general/api.interface';
import { mapeo } from '../../../../common/mapeos/administradores';
import { ContactoService } from '../../servicios/contacto.service';
import { RespuestaContacto } from '../../../../interfaces/contacto/contacto.interface';
import { TablaComunComponent } from '../../../../common/components/ui/tablas/tabla-comun/tabla-comun.component';

@Component({
  selector: 'app-contacto-lista',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterLink, TablaComunComponent],
  templateUrl: './contacto-lista.component.html',
  styleUrl: './contacto-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContactoListaComponent extends General implements OnInit {
  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: 'GenContacto',
  };
  cantidad_registros!: number;
  arrContactos: RespuestaContacto[];
  encabezados: any[];
  public mapeoAdministrador = mapeo;

  private contactoService = inject(ContactoService);

  ngOnInit(): void {
    this.consultarLista();
    this.encabezados = mapeo.Contacto.datos
      .filter((dato) => dato.visibleTabla === true)
      .map((dato) => dato.nombre);
  }

  consultarLista() {
    this.contactoService
      .lista(this.arrParametrosConsulta)
      .subscribe((respuesta) => {
        this.cantidad_registros = respuesta.cantidad_registros;
        this.arrContactos = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  editarContacto(id: number) {
    this.router.navigateByUrl(`/admin/contacto/editar/${id}`);
  }
  
  detalleContacto(id: number) {
    this.router.navigateByUrl(`/admin/contacto/detalle/${id}`);
  }
}
