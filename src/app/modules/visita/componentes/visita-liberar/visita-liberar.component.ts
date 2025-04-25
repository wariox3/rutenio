import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, AfterViewInit, ViewChild } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitaService } from '../../servicios/visita.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-visita-liberar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visita-liberar.component.html',
  styleUrl: './visita-liberar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitaLiberarComponent extends General implements AfterViewInit { 
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
      ? this._visitaService.consultarDocumento(this.despachoId, valorActual).pipe(
          switchMap(response => response?.id 
            ? this._visitaService.liberar(response.id) 
            : of(null)
          )
        )
      : this._visitaService.liberar(valorActual);

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