import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { General } from '../../../clases/general';
import { GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [NgSelectModule, CommonModule],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscadorComponent extends General {
  @Input({ required: true }) modeloConsulta: string;
  @Input({ required: true }) control = new FormControl();
  @Output() entidadSeleccionada: EventEmitter<any>;

  private readonly _generalService = inject(GeneralService);
  public listaOpciones: any[];

  constructor() {
    super();
    this.entidadSeleccionada = new EventEmitter();
  }

  ngOnInit(): void {
    this.consultarCiudad();
  }

  seleccionarEntidad(entidad: any) {
    if (!entidad) {
      this.consultarCiudad('');
      return;
    }

    this.entidadSeleccionada.emit(entidad);
  }

  consultarCiudad(nombre?: string) {
    let arrFiltros = {
      filtros: [],
      limite: 10,
      desplazar: 0,
      ordenamientos: [],
      limite_conteo: 10000,
      modelo: this.modeloConsulta,
      serializador: 'ListaAutocompletar',
    };

    if (nombre) {
      arrFiltros.filtros.push({
        operador: '__icontains',
        propiedad: 'nombre__icontains',
        valor1: nombre,
        valor2: '',
      });
    }

    this._generalService.autocompletar(arrFiltros).subscribe({
      next: (response) => {
        console.log(response.registros);
        this.listaOpciones = response.registros;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  buscarCiudadPorNombre(event?: any) {
    const excludedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    if (excludedKeys.includes(event?.key)) {
      return;
    }

    const ciudadNombre = event?.target.value || '';
    this.consultarCiudad(ciudadNombre);
  }
}
