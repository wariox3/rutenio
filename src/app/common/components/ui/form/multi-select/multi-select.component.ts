import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  ChangeDetectorRef,
  inject,
  Input,
  Output,
  SimpleChanges
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
  @Input() selectedOptions: number[] = []
  @Input() label: string = 'label';
  @Input() value: string = 'value';
  @Output() selectionChange = new EventEmitter<any[]>();

  changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['selectedOptions']) {
      console.log(changes['selectedOptions'].currentValue);
      this.selectedOptions = this._transformSelectedOptions(changes['selectedOptions'].currentValue);
      this.changeDetectorRef.detectChanges();
    }
  }

  private _transformSelectedOptions(selectedOptions: string): number[] {
    if (!selectedOptions) {
      return [];
    }
    return selectedOptions.split(',').map((option) => Number(option));
  }

  emitirSeleccion() {
    this.selectionChange.emit(this.selectedOptions);
  }
}
