import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HeaderBasicComponent } from '../../layouts/header-basic/header-basic.component';
import { SearchModalComponent } from '../../partials/search-modal/search-modal.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { AlertaSuspensionComponent } from "../../common/components/alerta-suspension/alerta-suspension.component";

@Component({
  selector: 'app-facturacion-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    SearchModalComponent,
    HeaderBasicComponent,
    AlertaSuspensionComponent
],
  templateUrl: './facturacion-layout.component.html',
  styleUrl: './facturacion-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FacturacionLayoutComponent implements OnInit {
  ngOnInit(): void {}
}
