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
    
    const valorActual = this.inputValue.trim()
    this.inputValue = '';

    // Un id de visita siempre es numérico. Si el valor NO es numérico (p. ej. un
    // código escaneado como 'CSV35'), solo puede ser un número de guía -> lo
    // resolvemos por número aunque el modo sea 'id'. Así el escaneo funciona y no
    // queda bloqueado. El backend filtra `numero` (CharField, acepta alfanumérico).
    const esNumerico = /^\d+$/.test(valorActual);
    const resolverPorNumero = this.searchByDocument || !esNumerico;

    const liberar$ = resolverPorNumero
      ? this._visitaApiService.consultarDocumento({ despacho_id: this.despachoId, numero: valorActual }).pipe(
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