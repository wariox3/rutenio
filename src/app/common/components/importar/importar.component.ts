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
import {
  BehaviorSubject,
  catchError,
  finalize,
  mergeMap,
  of,
  toArray,
} from 'rxjs';
import * as XLSX from 'xlsx';
import { General } from '../../clases/general';
import { GeneralService } from '../../services/general.service';
import { ButtonComponent } from '../ui/button/button.component';
import { ModalDefaultService } from '../ui/modals/modal-default/modal-default.service';
import { HttpService } from '../../services/http.service';

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
  @Output() exampleDownloadError: EventEmitter<any> = new EventEmitter<any>();
  @Input() archivosAdmitidos: string = '';
  @Input() url: string = '';
  @Input() archivoEjemplo: { nombre: string; ruta: string };
  @Input() exampleFileUrl: string = '';
  @Input() exampleFileName: string = '';

  private _generalService = inject(GeneralService);
  private _modalDefaultService = inject(ModalDefaultService);
  private _httpService = inject(HttpService);

  public erroresImportar: any[] = [];
  public selectedFile: File | null = null;
  public base64File: string | null = null;
  public fileName: string = '';
  public fileSize: string = '';
  public estaImportando$: BehaviorSubject<boolean>;
  public isDownloadingExample$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public errorMessage: string = '';

  constructor() {
    super();
    this.estaImportando$ = new BehaviorSubject(false);
    this.emitirCerrarModal = new EventEmitter();
    this.emitirConsultarLista = new EventEmitter();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.processFile(file);
    }
  }

  private processFile(file: File) {
    // Validar tipo de archivo si se especifica
    if (this.archivosAdmitidos) {
      const acceptedTypes = this.archivosAdmitidos
        .split(',')
        .map((type) => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!acceptedTypes.includes(fileExtension)) {
        this.alerta.mensajeError(
          'Tipo de archivo no válido',
          `Solo se permiten archivos: ${this.archivosAdmitidos}`
        );
        return;
      }
    }

    const fileSize = file.size;
    const fileSizeInKB = fileSize / 1024;

    this.fileSize = `${fileSizeInKB.toFixed(2)}KB`;
    this.fileName = file.name;
    this.selectedFile = file;
    this.convertToBase64(file);
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

  private _adaptarErroresImportar(errores: any[]) {
    of(...errores)
      .pipe(
        mergeMap((errorItem) =>
          of(
            ...Object.entries(errorItem.errores).map(
              ([campo, mensajes]: any) => ({
                fila: errorItem.fila,
                campo: campo,
                error: mensajes.join(', '),
              })
            )
          )
        ),
        toArray()
      )
      .subscribe((result) => {
        this.erroresImportar = result;
      });
  }

  // TODO: probar esta solucion para testear rendimineto
  // private _adaptarErroresImportar(errores: any[]) {
  //   this.erroresImportar = errores.reduce((acc, errorItem) => {
  //     const erroresAdaptados = Object.entries(errorItem.errores).map(
  //       ([campo, mensajes]: any) => ({
  //         fila: errorItem.fila,
  //         campo: campo,
  //         error: mensajes.join(', '),
  //       })
  //     );
  //     return acc.concat(erroresAdaptados);
  //   }, []);
  // }

  uploadFile() {
    if (this.base64File) {
      this.estaImportando$.next(true);
      this._modalDefaultService.actualizarEstadoModal(true);

      this._generalService
        .importar(this.url, { archivo_base64: this.base64File })
        .pipe(
          finalize(() => {
            this.estaImportando$.next(false);
            this._modalDefaultService.actualizarEstadoModal(false);
          })
        )
        .subscribe({
          next: () => {
            this.alerta.mensajaExitoso('Registros importados exitosamente');
            this.emitirCerrarModal.emit();
            this.emitirConsultarLista.emit();
          },
          error: (err) => {
            if (err.errores_validador) {
              this._adaptarErroresImportar(err.errores_validador);
            }
          },
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

  /**
   * Descarga el archivo de ejemplo
   * Soporta tanto URLs locales como externas
   */
  descargarEjemploImportar() {
    // Si se proporciona una URL externa, usamos esa primero
    if (this.exampleFileUrl) {
      this.downloadExampleFile();
      return;
    }

    // Si no hay URL externa, usamos el método local tradicional
    if (this.archivoEjemplo?.ruta) {
      this._generalService.descargarArchivoLocal(
        this.archivoEjemplo.ruta,
        this.archivoEjemplo.nombre
      );
    } else {
      this.errorMessage =
        'No se ha configurado una ruta para el archivo de ejemplo';
      this.alerta.mensajeError(
        'Error',
        'No se ha configurado una ruta para el archivo de ejemplo'
      );
    }
  }

  /**
   * Descarga el archivo de ejemplo desde una URL externa
   */
  downloadExampleFile(): void {
    if (!this.exampleFileUrl) {
      this.errorMessage =
        'No se ha configurado una URL para el archivo de ejemplo';
      return;
    }

    this.isDownloadingExample$.next(true);

    try {
      // Si la URL es relativa, usamos el servicio HTTP para descargar
      if (!this.exampleFileUrl.startsWith('http')) {
        this._httpService.descargarArchivo(this.exampleFileUrl, {});
        this.isDownloadingExample$.next(false);
      } else {
        // Si es una URL absoluta, creamos un enlace y simulamos un clic
        const link = document.createElement('a');
        link.href = this.exampleFileUrl;
        link.target = '_blank';
        link.download = this.exampleFileName || 'ejemplo.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.isDownloadingExample$.next(false);
      }
    } catch (error) {
      this.isDownloadingExample$.next(false);
      this.exampleDownloadError.emit(error);
      this.errorMessage = 'Error al descargar el archivo de ejemplo';
      this.alerta.mensajeError(
        'Error',
        'No se pudo descargar el archivo de ejemplo'
      );
    }
  }
}
