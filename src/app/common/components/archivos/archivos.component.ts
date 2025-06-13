import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal
} from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { ParametrosConsulta } from '../../../interfaces/general/api.interface';
import { ArchivosService } from '../../services/archivos.service';
import { FormatFechaPipe } from '../../pipes/formatear_fecha';

@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [FormatFechaPipe],
  templateUrl: './archivos.component.html',
  styleUrl: './archivos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivosComponent implements OnInit {
  @Input() modelo: string = '';
  @Input() registroId: number = 0;

  private readonly _generalService = inject(GeneralService);
  private readonly _archivosService = inject(ArchivosService);

  public listaArchivos = signal<any[]>([])

  ngOnInit(): void {
    this._consultarArchivos();
  }

  private _consultarArchivos() {
    let arrFiltros: ParametrosConsulta = {
      filtros: [
        {
          propiedad: 'codigo',
          valor1: this.registroId.toString(),
        },
        {
          propiedad: 'modelo',
          valor1: this.modelo,
        }
      ],
      limite: 10,
      desplazar: 0,
      ordenamientos: [],
      limite_conteo: 0,
      modelo: 'GenArchivo',
    };

    this._generalService.autocompletar(arrFiltros).subscribe((respuesta) => {
      this.listaArchivos.set(respuesta.registros)
    });
  }

  descargarArchivo(archivo){
    this._archivosService.descargarArchivoGeneral({
      id: archivo.id,
    });
  }

formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 MB';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

}
