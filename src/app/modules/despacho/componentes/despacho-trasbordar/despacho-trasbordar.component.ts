import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { CommonModule } from '@angular/common';
import { DespachoService } from '../../servicios/despacho.service';
import { FormsModule } from '@angular/forms';

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

  private _despachoService = inject(DespachoService);

  @Input() despachoId: any;
  codigoTrasbordo: string = '';

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.trasbordoInput.nativeElement.focus();
  }

  trasbordar() {
    this._despachoService
      .trasbordar(this.despachoId.id, this.codigoTrasbordo)
      .subscribe((response) => {
        this._despachoService.notificarActualizacionLista();
        this.alerta.mensajaExitoso(response.mensaje);
      });
  }
}
