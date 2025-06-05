import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { BehaviorSubject, catchError, finalize } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { ImportarComponent } from '../../../../common/components/importar/importar.component';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { VisitaApiService } from '../../servicios/visita-api.service';

@Component({
  selector: 'app-visita-importar-por-excel',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ImportarComponent],
  templateUrl: './visita-importar-por-excel.component.html',
  styleUrl: './visita-importar-por-excel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaImportarPorExcelComponent extends General {
  @Output() emitirCerrarModal: EventEmitter<boolean>;
  @Output() emitirConsultarLista: EventEmitter<void>;

  private _visitaApiService = inject(VisitaApiService);
  
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

  uploadFile() {
    if (this.base64File) {
      this.estaImportando$.next(true);

      this._visitaApiService
        .importarPorExcel({ archivo_base64: this.base64File })
        .pipe(
          catchError((err) => {
            if (err.errores_validador) {
              this.erroresImportar = err.errores_validador;
            }

            return err;
          }),
          finalize(() => {
            this.estaImportando$.next(false);
            this.emitirConsultarLista.emit();
            this.emitirCerrarModal.emit();
          })
        )
        .subscribe((response) => {
          this.alerta.mensajaExitoso('Se han cargado las guias con éxito');
        });
    } else {
      this.alerta.mensajeError('No se ha seleccionado ningún archivo', 'Error');
    }
  }
}
