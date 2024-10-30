import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-input-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-password.component.html',
  styleUrl: './input-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPasswordComponent {
  @Input() placeholder = '*********';
  @Input() control = new FormControl();

  public value: string = '';
  public visibleInput = false;
  public isDisabled: boolean = false;

  toggleVisibleInput() {
    this.visibleInput = !this.visibleInput;
  }
}
