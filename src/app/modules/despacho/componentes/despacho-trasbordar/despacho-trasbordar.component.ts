import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { DespachoApiService } from '../../servicios/despacho-api.service';
import { DespachoService } from '../../servicios/despacho.service';

@Component({
  selector: 'app-despacho-trasbordar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './despacho-trasbordar.component.html',
  styleUrl: './despacho-trasbordar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DespachoTrasbordarComponent extends General implements OnInit {
  @ViewChild('trasbordoInput') trasbordoInput!: ElementRef<HTMLInputElement>;
  @Output() cerrarModal = new EventEmitter<void>();

  private _despachoApiService = inject(DespachoApiService);
  private _despachoService = inject(DespachoService);

  @Input() despachoId: any;
  codigoTrasbordo: string = '';

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.trasbordoInput.nativeElement.focus();
  }

  trasbordar() {
    this._despachoApiService
      .trasbordar(this.despachoId.id, this.codigoTrasbordo)
      .subscribe((response) => {
        this._despachoService.notificarActualizacionLista();
        this.alerta.mensajaExitoso(response.mensaje);
        this.cerrarModal.emit();
      });
  }
}
