import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { VisitaService } from '../../servicios/visita.service';
import { catchError } from 'rxjs';
import { General } from '../../../../common/clases/general';

@Component({
  selector: 'app-visita-importar-por-excel',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './visita-importar-por-excel.component.html',
  styleUrl: './visita-importar-por-excel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisitaImportarPorExcelComponent extends General {
  private _visitaService = inject(VisitaService);

  public erroresImportar: any[] = [];
  public selectedFile: File | null = null;
  public base64File: string | null = null;
  public fileName: string = '';

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
      this._visitaService
        .importarVisitas({ archivo_base64: this.base64File })
        .pipe(
          catchError((err) => {
            if (err.errores_validador) {
              this.erroresImportar = err.errores_validador;
            }

            return err;
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
