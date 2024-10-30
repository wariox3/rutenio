import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-email.component.html',
  styleUrl: './input-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputEmailComponent {
  @Input() placeholder = 'john@example.com';
  @Input() control = new FormControl();

  public value: string = '';
  public isDisabled: boolean = false;
}
