import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { FranjaService } from '../../servicios/franja.service';

@Component({
  selector: 'app-franja-importar-por-kml',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './franja-importar-por-kml.component.html',
  styleUrl: './franja-importar-por-kml.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FranjaImportarPorKmlComponent extends General {
  @Output() emitirCerrarModal: EventEmitter<boolean>;
  @Output() emitirConsultarLista: EventEmitter<void>;

  private _franjaService = inject(FranjaService);
  public erroresImportar: any[] = [];
  public selectedFile: File | null = null;
  public base64File: string | null = null;
  public fileName: string = '';
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
      this.fileName = file.name;
      this.selectedFile = file;
      this.convertToBase64(file);
    }
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

  async toBase64(file: File) {
    try {
      const reader = new FileReader();
      const base64ConMetadatos: any = await new Promise((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      return base64ConMetadatos.split(',')[1];
    } catch (error) {
      throw new Error('Error al convertir el archivo a base64');
    }
  }

  async subirArchivo() {
    const archivoEnBase64 = await this.toBase64(this.selectedFile);

    this.estaImportando$.next(true);
    this._franjaService
      .importarArchivoKML(archivoEnBase64)
      .pipe(finalize(() => this.estaImportando$.next(false)))
      .subscribe(() => {
        this.emitirCerrarModal.emit()
        // this.consultarLista();
        // this.consultarFranjas();
        this.alerta.mensajaExitoso(
          'Se han importado las franjas exitosamente.'
        );
      });
  }
}
