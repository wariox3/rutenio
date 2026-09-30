import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { General } from '../../clases/general';
import { ButtonComponent } from '../ui/button/button.component';
import { GeneralApiService } from '../../../core/api/general-api.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent extends General implements OnInit {
  @Input() endpoint: string = '';
  @Input() acceptedFileTypes: string = '*';
  @Input() buttonText: string = 'Importar';
  @Input() buttonLoadingText: string = 'Importando...';
  @Input() cancelButtonText: string = 'Cancelar';
  @Input() maxFileSize: number = 10; // en MB
  @Input() additionalParams: { [key: string]: any } = {};
  @Input() useBase64: boolean = true; // true: envía base64; false: envía FormData

  @Input() showExampleButton: boolean = false;
  @Input() exampleButtonText: string = 'Ejemplo';
  @Input() exampleFileUrl: string = '';
  @Input() exampleFileName: string = 'ejemplo';

  @Output() uploadSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() uploadError: EventEmitter<any> = new EventEmitter<any>();
  @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() exampleDownloadError: EventEmitter<any> = new EventEmitter<any>();

  public selectedFile: File | null = null;
  public base64File: string | null = null;
  public fileName: string = '';
  public isUploading$: BehaviorSubject<boolean>;
  public isDownloadingExample$: BehaviorSubject<boolean>;
  public errorMessage: string | null = null;
  public fileSizeExceeded: boolean = false;

  private _generalApiService = inject(GeneralApiService);
  private _httpService = inject(HttpService);

  constructor() {
    super();
    this.isUploading$ = new BehaviorSubject<boolean>(false);
    this.isDownloadingExample$ = new BehaviorSubject<boolean>(false);
  }

  ngOnInit(): void {
    if (!this.endpoint) {
      console.warn('FileUploadComponent: No endpoint provided');
    }
    
    if (this.showExampleButton && !this.exampleFileUrl) {
      console.warn('FileUploadComponent: Example button is enabled but no URL was provided');
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.errorMessage = null;
    this.fileSizeExceeded = false;

    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > this.maxFileSize) {
        this.fileSizeExceeded = true;
        this.errorMessage = `El archivo excede el tamaño máximo permitido (${this.maxFileSize} MB)`;
        this.selectedFile = null;
        this.fileName = '';
        this.base64File = null;
        return;
      }

      this.fileName = file.name;
      this.selectedFile = file;
      this.fileSelected.emit(file);
      
      if (this.useBase64) {
        this.convertToBase64(file);
      }
    }
  }

  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      this.base64File = result.split(',')[1];
    };
    reader.onerror = (error) => {
      console.error('Error al convertir archivo a base64: ', error);
      this.errorMessage = 'Error al procesar el archivo';
    };
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'No se ha seleccionado ningún archivo';
      return;
    }

    if (!this.endpoint) {
      this.errorMessage = 'No se ha configurado un endpoint para la subida de archivos';
      return;
    }

    this.isUploading$.next(true);

    if (this.useBase64) {
      this.uploadBase64File();
    } else {
      this.uploadFormDataFile();
    }
  }

  private uploadBase64File(): void {
    if (!this.base64File) {
      this.isUploading$.next(false);
      this.errorMessage = 'Error al procesar el archivo';
      return;
    }

    const requestData = {
      ...this.additionalParams,
      archivo_base64: this.base64File,
    };

    this._generalApiService
      .importarArchivo(this.endpoint, requestData)
      .pipe(finalize(() => this.isUploading$.next(false)))
      .subscribe({
        next: (response) => {
          this.uploadSuccess.emit(response);
          this.alerta.mensajaExitoso('Archivo subido exitosamente');
          this.resetForm();
        },
        error: (error) => {
          this.uploadError.emit(error);
          this.errorMessage = 'Error al subir el archivo';
          this.alerta.mensajeError('Error', 'No se pudo subir el archivo');
        }
      });
  }

  private uploadFormDataFile(): void {
    const formData = new FormData();
    formData.append('archivo', this.selectedFile as File);
    Object.keys(this.additionalParams).forEach(key => {
      formData.append(key, this.additionalParams[key]);
    });

    // TODO: subida por FormData aún no implementada en GeneralApiService.
    this.isUploading$.next(false);
    this.errorMessage = 'La subida como FormData no está implementada en este componente';
    console.error('La subida como FormData no está implementada en el GeneralApiService');
  }

  downloadExampleFile(): void {
    if (!this.exampleFileUrl) {
      this.errorMessage = 'No se ha configurado una URL para el archivo de ejemplo';
      return;
    }

    this.isDownloadingExample$.next(true);
    
    try {
      if (!this.exampleFileUrl.startsWith('http')) {
        this._httpService.descargarArchivo(this.exampleFileUrl, {});
        this.isDownloadingExample$.next(false);
      } else {
        const link = document.createElement('a');
        link.href = this.exampleFileUrl;
        link.target = '_blank';
        link.download = this.exampleFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.isDownloadingExample$.next(false);
      }
    } catch (error) {
      this.isDownloadingExample$.next(false);
      this.exampleDownloadError.emit(error);
      this.errorMessage = 'Error al descargar el archivo de ejemplo';
      this.alerta.mensajeError('Error', 'No se pudo descargar el archivo de ejemplo');
    }
  }

  resetForm(): void {
    this.selectedFile = null;
    this.base64File = null;
    this.fileName = '';
    this.errorMessage = null;
    this.fileSizeExceeded = false;
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }
}
