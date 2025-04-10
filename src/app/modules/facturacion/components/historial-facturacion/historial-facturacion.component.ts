import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { HttpService } from '../../../../common/services/http.service';
import { General } from '../../../../common/clases/general';
import { ContenedorService } from '../../../contenedores/services/contenedor.service';
import { switchMap, tap } from 'rxjs';
import { Movimiento } from '../../interfaces/Facturacion';
import { CommonModule } from '@angular/common';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { ConvertirValorMonedaPipe } from '../../../../common/pipes/convertir_valor_moneda';

@Component({
  selector: 'app-historial-facturacion',
  standalone: true,
  imports: [CommonModule, FormatFechaPipe, ConvertirValorMonedaPipe],
  templateUrl: './historial-facturacion.component.html',
  styleUrl: './historial-facturacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialFacturacionComponent extends General implements OnInit {

  constructor(private contenedorService: ContenedorService, private httpService: HttpService){
    super()
  }

  movientos: Movimiento[];

  ngOnInit(): void {
    this.store
    .select(obtenerUsuarioId)
    .pipe(
      switchMap((respuestaUsuarioId) =>
        this.contenedorService.consultaUsuario(respuestaUsuarioId)
      ),
      tap((respuestaConsultaUsuario) => {
        this.movientos = respuestaConsultaUsuario.movimientos;
        this.changeDetectorRef.detectChanges();
      })
    )
    .subscribe();
  }

  descargarDocumento(documento_id:any) {
    this.httpService.descargarArchivoDominio('contenedor/movimiento/descargar/', {
      'id': documento_id
    });
  }

 }
