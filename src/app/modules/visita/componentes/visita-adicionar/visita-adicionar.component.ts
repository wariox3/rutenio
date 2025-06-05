import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, of, switchMap } from 'rxjs';
import { General } from '../../../../common/clases/general';
import { VisitaApiService } from '../../servicios/visita-api.service';
import { VisitaService } from '../../servicios/visita.service';

@Component({
  selector: 'app-visita-adicionar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visita-adicionar.component.html',
  styleUrl: './visita-adicionar.component.css',
})
export class VisitaAdicionarComponent extends General implements AfterViewInit {
  private _visitaService = inject(VisitaService);
  private _vistiaApiService = inject(VisitaApiService);
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

    const valorActual = Number(this.inputValue);

    const adicionar$ = this.searchByDocument
      ? this._vistiaApiService
          .consultarDocumento({ numero: valorActual, estado_despacho: false })
          .pipe(
            switchMap((response) =>
              response?.id
                ? this._vistiaApiService.adicionar(
                    this.despachoId,
                    response.id
                  )
                : of(null)
            )
          )
      : this._vistiaApiService.adicionar(this.despachoId, valorActual);

    adicionar$
      .pipe(
        finalize(() => {
          this.establecerFoco();
          this.changeDetectorRef.detectChanges();
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
          this.changeDetectorRef.detectChanges();
        },
      });
  }

  private establecerFoco(): void {
    setTimeout(() => {
      this.inputAdicionar.nativeElement.focus();
    });
  }
}
