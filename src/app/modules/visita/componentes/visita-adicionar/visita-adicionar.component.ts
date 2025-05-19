import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, AfterViewInit, ViewChild } from '@angular/core';
import { General } from '../../../../common/clases/general';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitaService } from '../../servicios/visita.service';
import { finalize, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-visita-adicionar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visita-adicionar.component.html',
  styleUrl: './visita-adicionar.component.css',
})
export class VisitaAdicionarComponent extends General implements AfterViewInit { 
  private _visitaService = inject(VisitaService);
  selectedOption: string = 'id';
  inputValue: string = '';
  searchByDocument: boolean = false;
  @Input() despachoId: number;
  @ViewChild('inputAdicionar') inputAdicionar!: ElementRef;

  ngAfterViewInit(): void {
    this.establecerFoco();
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.searchByDocument = option === 'numero';
    this.inputValue = '';
    this.establecerFoco();
  }

  adicionar(): void {
    if (!this.selectedOption || !this.inputValue.trim()) return;
    
    const valorActual = Number(this.inputValue)
    
    const adicionar$ = this.searchByDocument 
      ? this._visitaService.consultarDocumentoVisita(valorActual).pipe(
          switchMap(response => response?.id 
            ? this._visitaService.adicionar(this.despachoId, Number(response.id)) 
            : of(null)
          )
        )
      : this._visitaService.adicionar(this.despachoId, valorActual);

    adicionar$
    .pipe(
      finalize(() => {
        this.establecerFoco();
        this.changeDetectorRef.detectChanges()
      })
    )
    .subscribe({
      next: (response) => {
        if (response) {
          this.inputValue = '';
          this._visitaService.notificarActualizacionLista();
          this.alerta.mensajaExitoso(response.mensaje);
        }
      },
      error: () => {
        this.inputValue = valorActual.toString();
        this.changeDetectorRef.detectChanges()
      }
    });
  }

  private establecerFoco(): void {
    setTimeout(() => {
      this.inputAdicionar.nativeElement.focus();
    });
  }
}