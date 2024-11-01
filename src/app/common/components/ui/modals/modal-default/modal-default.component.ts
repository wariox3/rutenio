import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-default.component.html',
  styleUrl: './modal-default.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDefaultComponent {
  @Input() titulo: string;
  @Input() id: string;
  @Input() displayFooter: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
