// input-textarea.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-textarea.component.html',
  styleUrl: './input-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextareaComponent {
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() maxLength: number = 0;
  @Input() minLength: number = 0;
  @Input({ required: true }) control = new FormControl();
  @Input() errorTemplate?: TemplateRef<any>;
  @Input() fieldName?: string = 'El campo';
}