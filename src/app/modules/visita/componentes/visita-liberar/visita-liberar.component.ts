import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { VisitaService } from '../../servicios/visita.service';

@Component({
  selector: 'app-visita-liberar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visita-liberar.component.html',
  styleUrl: './visita-liberar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaLiberarComponent extends General implements AfterViewInit { 
  private _visitaApiService = inject(VisitaApiService);
  private _visitaService = inject(VisitaService);
  selectedOption: string = 'id';
  inputValue: string = '';
  searchByDocument: boolean = false;
  @Input() despachoId: number;
  @ViewChild('inputLiberar') inputLiberar!: ElementRef;

  ngAfterViewInit(): void {
    this.establecerFoco();
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.searchByDocument = option === 'numero';
    this.inputValue = '';
    this.establecerFoco();
  }

  liberar(): void {
    if (!this.selectedOption || !this.inputValue.trim()) return;
    
    const valorActual = this.inputValue
    this.inputValue = '';
    
    const liberar$ = this.searchByDocument 
      ? this._visitaApiService.consultarDocumento({ despacho_id: this.despachoId, numero: Number(valorActual) }).pipe(
          switchMap(response => response?.id 
            ? this._visitaApiService.liberar(String(response.id)) 
            : of(null)
          )
        )
      : this._visitaApiService.liberar(valorActual);

    liberar$.subscribe({
      next: (response) => {
        if (response) {
          this._visitaService.notificarActualizacionLista();
          this.alerta.mensajaExitoso(response.mensaje);
          this.establecerFoco();
        }
      },
      error: () => {
        this.inputValue = valorActual;
        this.establecerFoco();
      }
    });
  }

  private establecerFoco(): void {
    setTimeout(() => {
      this.inputLiberar.nativeElement.focus();
    });
  }
}