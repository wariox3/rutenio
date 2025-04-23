import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitaService } from '../../servicios/visita.service';

@Component({
  selector: 'app-visita-liberar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visita-liberar.component.html',
  styleUrl: './visita-liberar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaLiberarComponent extends General implements OnInit { 
  private _visitaService = inject(VisitaService);
  selectedOption: string | null = null;
  inputValue: string = '';
  searchByDocument: boolean = false;
  @Input() despachoId: number;

  ngOnInit(): void {
    
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.searchByDocument = option === 'numero';
    this.inputValue = '';
  }

  liberar(): void {
    if (!this.selectedOption || !this.inputValue) return;
    if (this.searchByDocument) {
      this._visitaService.consultarDocumento(this.despachoId, this.inputValue).subscribe({
        next: (response) => {
          if (response?.id) {
            this._visitaService.liberar(response.id).subscribe({
              next: (liberarResponse) => {
                this._visitaService.notificarActualizacionLista();
                this.alerta.mensajaExitoso(liberarResponse?.mensaje);
              }
            });
          }
        },
      });
    } else {
      this._visitaService.liberar(this.inputValue).subscribe({
        next: (response) => {
          this._visitaService.notificarActualizacionLista();
          this.alerta.mensajaExitoso(response?.mensaje);
        },
      });
    }
  }
}