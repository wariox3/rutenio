import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { ModalService } from '../service/modal.service';

@Component({
  selector: 'app-modal-standard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-standard.component.html',
  styleUrl: './modal-standard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalStandardComponent {
  private document = inject(DOCUMENT);
  private modalService = inject(ModalService);

  @Input() modalId!: string;
  @Input() title = '';
  @Input() showCloseButton = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  @Input() closeOnOutsideClick = true;
  @Input() closeOnEsc = true;

  @Output() closed = new EventEmitter<void>();

  public isOpen = signal<boolean>(false);

  ngOnInit() {
    if (!this.modalId) {
      throw new Error('Modal must have an id');
    }
    this.modalService.register(this.modalId);
    this.modalService.isOpen$(this.modalId).subscribe((isOpen) => {
      this.isOpen.set(isOpen);
      if (!isOpen) {
        this.closed.emit();
      } 
    });
  }

  ngOnDestroy() {
    this.modalService.unregister(this.modalId);
  }

  get hasFooter(): boolean {
    return !!this.document.querySelector('[footer]');
  }

  get modalSize(): string {
    const sizes = {
      sm: 'sm:max-w-sm',
      md: 'sm:max-w-md',
      lg: 'sm:max-w-lg',
      xl: 'sm:max-w-xl',
      '2xl': 'sm:max-w-2xl',
    };
    return `${sizes[this.size]} w-full`;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.closeOnEsc && this.isOpen()) {
      this.closeModal();
    }
  }

  closeModal(): void {
    if (this.closeOnOutsideClick) {
      this.isOpen.set(false);
      this.modalService.close(this.modalId);
      this.closed.emit();
    }
  }
}
