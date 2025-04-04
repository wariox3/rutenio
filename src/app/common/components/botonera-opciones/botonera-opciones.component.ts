import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDefaultComponent } from "../ui/modals/modal-default/modal-default.component";
import { BehaviorSubject } from 'rxjs';
import { ArchivosComponent } from "../archivos/archivos.component";

@Component({
  selector: 'app-botonera-opciones',
  standalone: true,
  imports: [CommonModule, ModalDefaultComponent, ArchivosComponent],
  templateUrl: './botonera-opciones.component.html',
  styleUrls: ['./botonera-opciones.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotoneraOpcionesComponent implements OnInit {

  public toggleModalArchivos$ = new BehaviorSubject(false);
  
  @Input() modelo: string = '';
  @Input() registroId: number = 0;

  ngOnInit(): void {
    
  }

  abrirModalArchivos() {
    this.toggleModalArchivos$.next(true);
  }

  cerrarModalArchivos() {
    this.toggleModalArchivos$.next(false);
  }
}