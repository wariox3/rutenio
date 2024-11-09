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

@Component({
  selector: 'app-modal-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-default.component.html',
  styleUrl: './modal-default.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDefaultComponent implements AfterViewInit {
  @Input() titulo: string;
  @Input() id: string;
  @Input() displayFooter: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() emitirModalCerrado: EventEmitter<void>;

  private modal: KTModal;
  private eventId: string;

  constructor() {
    this.emitirModalCerrado = new EventEmitter();
  }

  ngOnDestroy(): void {
    if (this.modal) {
      this.modal.off('hide', this.eventId);
    }
  }

  ngAfterViewInit(): void {
    this._initCerrarModalEventListener();
  }

  private _initCerrarModalEventListener() {
    const modalEl: HTMLElement = document.querySelector(`#${this.id}`);
    this.modal = KTModal.getInstance(modalEl);

    this.eventId = this.modal?.on('hide', (detail) => {
      this.emitirModalCerrado.emit();
    });
  }
}
