import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-full-loader-default',
  standalone: true,
  imports: [],
  templateUrl: './full-loader-default.component.html',
  styleUrl: './full-loader-default.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullLoaderDefaultComponent {
  @Input() mostrarCargando: boolean = true;
}
