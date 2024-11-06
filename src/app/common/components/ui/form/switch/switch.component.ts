import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent { 

  @Input() titulo = '';
  @Input({ required: true }) control = new FormControl();

}
