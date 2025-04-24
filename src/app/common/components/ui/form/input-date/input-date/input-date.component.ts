import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-date',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDateComponent {
  @Input() placeholder = 'Seleccione una fecha';
  @Input() control = new FormControl();
  @Input() minDate: string | null = null;
  @Input() maxDate: string | null = null;

  public value: string = '';
  public isDisabled: boolean = false;
}