import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-group-default',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-group-default.component.html',
  styleUrl: './input-group-default.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupDefaultComponent {
  @Input() placeholder = '';
  @Input() control = new FormControl();
  @Input() posicion: 'derecha' | 'izquierda' = 'derecha';
  @Input() textoAgregado: string = '';

  public value: string = '';
  public isDisabled: boolean = false;
}
