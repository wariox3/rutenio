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
import { SoloNumerosDirective } from '../../../../common/directivas/solo-numeros.directive';

@Component({
  selector: 'app-despacho-trasbordar',
  standalone: true,
  imports: [CommonModule, FormsModule, SoloNumerosDirective],
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
    // Se escribia el codigo a mano y llegaba con basura ("17631." con punto) que
    // reventaba el .get(pk=...) del backend. Se dejan solo digitos.
    const codigo = this.codigoTrasbordo.replace(/\D/g, '');
    if (!codigo) {
      return;
    }
    this._despachoApiService
      .trasbordar(this.despachoId, codigo)
      .subscribe((response) => {
        this._despachoService.notificarActualizacionLista();
        this.alerta.mensajaExitoso(response.mensaje);
        this.cerrarModal.emit();
      });
  }
}
