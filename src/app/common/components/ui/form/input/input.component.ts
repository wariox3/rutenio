import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SoloNumerosDirective } from '../../../../directivas/solo-numeros.directive';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SoloNumerosDirective],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  @Input() placeholder = '';
  @Input() soloNumeros = false;
  @Input() type = 'text';
  @Input() maxLenght: number = 0;
  @Input() minLength: number = 0;
  @Input({ required: true }) control = new FormControl();
  @Input() errorTemplate?: TemplateRef<any>;

  public value: string = '';
  public isDisabled: boolean = false;
}
