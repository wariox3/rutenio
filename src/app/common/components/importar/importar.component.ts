import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { saveAs } from 'file-saver';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import * as XLSX from 'xlsx';
import { General } from '../../clases/general';
import { GeneralService } from '../../services/general.service';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-importar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: `./importar.component.html`,
  styleUrl: './importar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportarComponent extends General {
  @Output() emitirCerrarModal: EventEmitter<boolean>;
  @Output() emitirConsultarLista: EventEmitter<void>;
  @Input() archivosAdmitidos: string = '';
  @Input() url: string = '';
  @Input() archivoEjemplo: { nombre: string; ruta: string };

  private _generalService = inject(GeneralService);

  public erroresImportar: any[] = [];
  public selectedFile: File | null = null;
  public base64File: string | null = null;
  public fileName: string = '';
  public fileSize: string = '';
  public estaImportando$: BehaviorSubject<boolean>;

  constructor() {
    super();
    this.estaImportando$ = new BehaviorSubject(false);
    this.emitirCerrarModal = new EventEmitter();
    this.emitirConsultarLista = new EventEmitter();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileSize = file.size;

      const fileSizeInKB = fileSize / 1024;
      const fileSizeInMB = fileSizeInKB / 1024;

      this.fileSize = `${fileSizeInKB.toFixed(2)}KB`;

      this.fileName = file.name;
      this.selectedFile = file;
      this.convertToBase64(file);
    }
  }

  removerArchivoSeleccionado() {
    this.selectedFile = null;
    this.base64File = null;
    this.fileName = '';
    this.fileSize = '';
  }

  convertToBase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      this.base64File = result.split(',')[1];
    };
    reader.onerror = (error) => {
      console.error('Error: ', error);
    };
  }

  uploadFile() {
    if (this.base64File) {
      this.estaImportando$.next(true);

      this._generalService
        .importar(this.url, { archivo_base64: this.base64File })
        .pipe(
          finalize(() => {
            this.estaImportando$.next(false);
            this.emitirConsultarLista.emit();
            this.emitirCerrarModal.emit();
          }),
          catchError((err) => {
            if (err.errores_validador) {
              this.erroresImportar = err.errores_validador;
            }

            return of(null);
          })
        )
        .subscribe((response) => {
          if (response.mensaje) {
            this.alerta.mensajaExitoso(response.mensaje);
          }
        });
    } else {
      this.alerta.mensajeError('No se ha seleccionado ningún archivo', 'Error');
    }
  }

  descargarExcelErroresImportar() {
    const nombreArchivo = 'errores';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.erroresImportar
    );
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, nombreArchivo);
  }

  descargarEjemploImportar() {
    this._generalService.descargarArchivoLocal(
      this.archivoEjemplo.ruta,
      this.archivoEjemplo.nombre
    );
  }
}
