import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-secuencial-loader',
  standalone: true,
  imports: [],
  template: ` <div class="fake-loading">
    @if (currentText()) {
      <span [@fadeInOut]>{{ currentText() }}</span>
    }
  </div>`,
  styleUrl: './secuencial-loader.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
      transition('* => void', [
        animate('500ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuencialLoaderComponent implements OnInit, OnDestroy {
  @Input() texts: string[] = [];
  @Input() interval: number = 3000;

  public currentText = signal<string>('');
  private currentIndex: number = 0;
  private intervalId: any;
  private isLastText: boolean = false;


  ngOnInit(): void {
    if (this.texts.length > 0) {
      this.currentText.set(this.texts[this.currentIndex]);
      this.startSequence();
    }
  }

  ngOnDestroy(): void {
    this.clearSequence();
  }

  startSequence(): void {
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.texts.length - 1) {
        this.currentIndex++;
        this.currentText.set(this.texts[this.currentIndex]);
      } else {
        this.isLastText = true;
        this.clearSequence();
      }
    }, this.interval);
  }

  clearSequence(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
