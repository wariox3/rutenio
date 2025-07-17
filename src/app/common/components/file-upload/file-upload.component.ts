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
  // Configuración del componente
  @Input() endpoint: string = '';
  @Input() acceptedFileTypes: string = '*'; // Por defecto acepta cualquier tipo de archivo
  @Input() buttonText: string = 'Importar';
  @Input() buttonLoadingText: string = 'Importando...';
  @Input() cancelButtonText: string = 'Cancelar';
  @Input() maxFileSize: number = 10; // Tamaño máximo en MB
  @Input() additionalParams: { [key: string]: any } = {};
  @Input() useBase64: boolean = true; // Si es true, envía el archivo como base64, si es false, envía como FormData
  
  // Configuración del botón de ejemplo
  @Input() showExampleButton: boolean = false;
  @Input() exampleButtonText: string = 'Ejemplo';
  @Input() exampleFileUrl: string = '';
  @Input() exampleFileName: string = 'ejemplo';

  // Eventos de salida
  @Output() uploadSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() uploadError: EventEmitter<any> = new EventEmitter<any>();
  @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() exampleDownloadError: EventEmitter<any> = new EventEmitter<any>();

  // Variables internas
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

  /**
   * Maneja el cambio de archivo seleccionado
   * @param event Evento del input file
   */
  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.errorMessage = null;
    this.fileSizeExceeded = false;
    
    if (file) {
      // Validar tamaño del archivo
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

  /**
   * Convierte un archivo a base64
   * @param file Archivo a convertir
   */
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

  /**
   * Sube el archivo al servidor
   */
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

  /**
   * Sube el archivo como base64
   */
  private uploadBase64File(): void {
    if (!this.base64File) {
      this.isUploading$.next(false);
      this.errorMessage = 'Error al procesar el archivo';
      return;
    }

    // Crear objeto con los parámetros adicionales y el archivo en base64
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

  /**
   * Sube el archivo como FormData
   */
  private uploadFormDataFile(): void {
    const formData = new FormData();
    
    // Añadir el archivo al FormData
    formData.append('archivo', this.selectedFile as File);
    
    // Añadir parámetros adicionales al FormData
    Object.keys(this.additionalParams).forEach(key => {
      formData.append(key, this.additionalParams[key]);
    });

    // Aquí se usaría un método específico para subir FormData que no está implementado en el GeneralApiService
    // Por ahora, mostramos un error
    this.isUploading$.next(false);
    this.errorMessage = 'La subida como FormData no está implementada en este componente';
    console.error('La subida como FormData no está implementada en el GeneralApiService');
  }

  /**
   * Descarga el archivo de ejemplo
   */
  downloadExampleFile(): void {
    if (!this.exampleFileUrl) {
      this.errorMessage = 'No se ha configurado una URL para el archivo de ejemplo';
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

  /**
   * Reinicia el formulario
   */
  resetForm(): void {
    this.selectedFile = null;
    this.base64File = null;
    this.fileName = '';
    this.errorMessage = null;
    this.fileSizeExceeded = false;
  }

  /**
   * Cancela la subida y emite evento
   */
  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }
}
