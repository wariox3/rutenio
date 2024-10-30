import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-input-email',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>input-email works!</p>`,
  styleUrl: './input-email.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputEmailComponent { }
