import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

export interface MultiSelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
})
export class MultiSelectComponent {
  @Input() options: any[] = [];
  @Input() selectedOptions: any[] = [];
  @Input() label: string = 'label';
  @Input() value: string = 'value';
  @Output() selectionChange = new EventEmitter<any[]>();

  constructor() {}

  emitirSeleccion() {
    this.selectionChange.emit(this.selectedOptions);
  }
}
