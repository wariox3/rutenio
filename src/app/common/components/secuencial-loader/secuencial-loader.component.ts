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
      state('void', style({ opacity: 0 })), // Estado inicial (invisible)
      transition('void => *', [
        style({ opacity: 0 }), // Inicia invisible
        animate('500ms ease-in', style({ opacity: 1 })), // Fade in
      ]),
      transition('* => void', [
        animate('500ms ease-out', style({ opacity: 0 })), // Fade out
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuencialLoaderComponent implements OnInit, OnDestroy {
  @Input() texts: string[] = []; // Textos a mostrar
  @Input() interval: number = 3000; // Intervalo en milisegundos

  public currentText = signal<string>(''); // Texto actual
  private currentIndex: number = 0; // Índice del texto actual
  private intervalId: any; // ID del intervalo
  private isLastText: boolean = false; // Bandera para saber si es el último texto


  ngOnInit(): void {
    if (this.texts.length > 0) {
      this.currentText.set(this.texts[this.currentIndex]); // Mostrar el primer texto
      this.startSequence(); // Iniciar la secuencia
    }
  }

  ngOnDestroy(): void {
    this.clearSequence(); // Limpiar el intervalo al destruir el componente
  }

  startSequence(): void {
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.texts.length - 1) {
        // Si no es el último texto, avanzar
        this.currentIndex++;
        this.currentText.set(this.texts[this.currentIndex]);
      } else {
        // Si es el último texto, detener el intervalo
        this.isLastText = true;
        this.clearSequence();
      }
    }, this.interval);
  }

  clearSequence(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Limpiar el intervalo
    }
  }
}
