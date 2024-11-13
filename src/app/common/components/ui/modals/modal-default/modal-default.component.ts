import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { KTModal } from '../../../../../../metronic/core';
import { BehaviorSubject } from 'rxjs';
import { General } from '../../../../clases/general';

@Component({
  selector: 'app-modal-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-default.component.html',
  styleUrl: './modal-default.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDefaultComponent extends General implements AfterViewInit {
  @Input() titulo: string;
  @Input() id: string;
  @Input() displayFooter: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() emitirModalCerrado: EventEmitter<void>;
  
  public abierto = new BehaviorSubject(false);

  private modal: KTModal;
  private eventHideId: string;
  private eventShowId: string;

  constructor() {
    super()
    this.emitirModalCerrado = new EventEmitter();
  }

  ngOnDestroy(): void {
    if (this.modal) {
      this.modal.off('hide', this.eventHideId);
      this.modal.off('show', this.eventShowId);
    }
  }

  ngAfterViewInit(): void {
    this._initCerrarModalEventListener();
    this._initAbrirModalEventListener();
  }

  private _initAbrirModalEventListener() {
    const modalEl: HTMLElement = document.querySelector(`#${this.id}`);
    this.modal = KTModal.getInstance(modalEl);

    this.eventShowId = this.modal?.on('show', (detail) => {
      this.abierto.next(true);
      
    });
  }

  private _initCerrarModalEventListener() {
    const modalEl: HTMLElement = document.querySelector(`#${this.id}`);
    this.modal = KTModal.getInstance(modalEl);

    this.eventHideId = this.modal?.on('hide', (detail) => {
      this.emitirModalCerrado.emit();
      this.abierto.next(false);

    });
  }
}
