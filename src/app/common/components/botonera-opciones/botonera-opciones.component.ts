import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-botonera-opciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown" data-dropdown="true" data-dropdown-trigger="click" data-dropdown-dismiss="true">
      <button class="dropdown-toggle btn btn-light">Opciones
      </button>
      <div class="dropdown-content w-full max-w-56 py-2">
        <div class="menu menu-default flex flex-col w-full">
          <div class="menu-item">
            <button class="menu-link" (click)="abrirModalArchivos.emit()">
              <span class="menu-icon">
                <i class="ki-filled ki-document"></i>
              </span>
              <span class="menu-title">Archivos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./botonera-opciones.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivosComponent {
  @Input() modelo: string = '';
  @Input() registroId: number = 0;
  @Output() abrirModalArchivos = new EventEmitter<void>();
}