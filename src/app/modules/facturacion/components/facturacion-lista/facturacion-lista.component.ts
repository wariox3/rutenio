import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { General } from '../../../../common/clases/general';
import { obtenerUsuarioId } from '../../../../redux/selectors/usuario.selector';
import { BehaviorSubject, Subject, zip } from 'rxjs';
import { FacturacionService } from '../../servicios/facturacion.service';
import { Consumo, Factura } from '../../interfaces/Facturacion';
import { FormatFechaPipe } from '../../../../common/pipes/formatear_fecha';
import { ConvertirValorMonedaPipe } from '../../../../common/pipes/convertir_valor_moneda';
import { FechasService } from '../../../../common/services/fechas.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { AlertaService } from '../../../../common/services/alerta.service';
import { ContenedorService } from '../../../contenedores/services/contenedor.service';
import { HistorialFacturacionComponent } from '../historial-facturacion/historial-facturacion.component';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';
import { InformacionFacturacionComponent } from '../informacion-facturacion/informacion-facturacion.component';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    FormatFechaPipe,
    ConvertirValorMonedaPipe,
    CommonModule,
    HistorialFacturacionComponent,
    ModalDefaultComponent,
    InformacionFacturacionComponent,
  ],
  templateUrl: './facturacion-lista.component.html',
  styleUrl: './facturacion-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FacturacionComponent
  extends General
  implements OnInit, OnDestroy
{
  constructor(
    private facturacionService: FacturacionService,
    public fechaServices: FechasService,
    private renderer: Renderer2,
    public alertaService: AlertaService,
    private contenedorServices: ContenedorService
  ) {
    super();
  }

  public registrosSeleccionados = signal<number[]>([]);
  facturas: Factura[] = [];
  consumos: Consumo[] = [];
  active: number = 1;
  consumoTotal = 0;
  codigoUsuario = 0;

  arrFacturasSeleccionados: any[] = [];
  arrFacturacionInformacion: any[] = [];
  totalPagar = new BehaviorSubject(0);
  public toggleModal$ = new BehaviorSubject(false);
  public informacionFacturacionSeleccionadaId: string;
  informacionFacturacionSeleccionada: number | null = null;
  public estaEditando = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.store.select(obtenerUsuarioId).subscribe((codigoUsuario) => {
      this.codigoUsuario = codigoUsuario;
      this.changeDetectorRef.detectChanges();
    });
    this.consultarInformacion();
  }

  consultarInformacion() {
    const hoy = new Date();
    const fechaHasta = hoy.toISOString().slice(0, 10);
    zip(
      this.facturacionService.facturacion(this.codigoUsuario),
      this.facturacionService.facturacionFechas(this.codigoUsuario, fechaHasta),
      this.facturacionService.informacionFacturacion(this.codigoUsuario)
    ).subscribe((respuesta) => {
      this.facturas = respuesta[0].movimientos;
      this.consumos = respuesta[1].consumos;
      this.arrFacturacionInformacion = respuesta[2].informaciones_facturacion;
      if (this.arrFacturacionInformacion.length > 0) {
        this.informacionFacturacionSeleccionada =
          this.arrFacturacionInformacion[0].id;
      }
      respuesta[1].consumos.map((consumo: Consumo) => {
        this.consumoTotal += consumo.vr_total;
      });

      this.facturas.forEach((factura) => {
        this.agregarRegistrosPagar(factura);
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  public idEstaEnLista(id: number): boolean {
    return this.registrosSeleccionados().indexOf(id) !== -1;
  }

  public agregarIdARegistrosSeleccionados(id: number) {
    this.registrosSeleccionados().push(id);
  }

  public removerIdRegistrosSeleccionados(id: number) {
    const itemsFiltrados = this.registrosSeleccionados().filter(
      (item) => item !== id
    );
    this.registrosSeleccionados.set(itemsFiltrados);
  }

  agregarRegistrosPagar(item: Factura) {
    if (this.informacionFacturacionSeleccionada === null || '') {
      this.alertaService.mensajeError(
        'Error',
        'Debe seleccionar la información de facturación antes de realizar el pago'
      );
      return;
    }

    const index = this.arrFacturasSeleccionados.findIndex(
      (documento) => documento.id === item.id
    );
    let valorActualPagar = this.totalPagar.getValue();

    if (index !== -1) {
      this.totalPagar.next(
        valorActualPagar - parseInt(item.vr_saldo_enmascarado)
      );
      this.arrFacturasSeleccionados.splice(index, 1);
      this.removerIdRegistrosSeleccionados(item.id);
      this.changeDetectorRef.detectChanges();
    } else {
      this.totalPagar.next(
        valorActualPagar + parseInt(item.vr_saldo_enmascarado)
      );
      this.arrFacturasSeleccionados.push(item);
      this.agregarIdARegistrosSeleccionados(item.id);
      this.changeDetectorRef.detectChanges();
    }

    let referencia = '';
    referencia = this.arrFacturasSeleccionados
      .map((factura: Factura, index: number, array: Factura[]) => {
        if (index === array.length - 1) {
          return factura.id;
        } else {
          return factura.id + '-';
        }
      })
      .join('');

    if (referencia !== '') {
      this.contenedorServices
        .contenedorGenerarIntegridad({
          referencia,
          monto: `${this.totalPagar.getValue()}`,
        })
        .subscribe((respuesta) => {
          this.habitarBtnWompi(respuesta.hash, referencia);
        });
    }
  }

  getIdentificacionPrefix(id: number): string {
    switch (id) {
      case 1:
        return 'RC';
      case 2:
        return 'TI';
      case 3:
        return 'CC';
      case 4:
        return 'TE';
      case 5:
        return 'CE';
      case 6:
        return 'NI';
      case 7:
        return 'PB';
      case 8:
        return 'TE';
      case 9:
        return 'RC';
      default:
        return 'NI';
    }
  }

  habitarBtnWompi(hash: string, referencia: string) {
    let url = 'http://localhost:4200/estado';
    if (environment.production) {
      url = `${environment.dominioHttp}://${environment.dominioApp.slice(
        1
      )}/estado`;
    }

    this.totalPagar.subscribe((total) => {
      const wompiWidget = document.getElementById('wompiWidget');
      if (total > 0) {
        const script = this.renderer.createElement('script');
        this.renderer.setAttribute(
          script,
          'src',
          'https://checkout.wompi.co/widget.js'
        );
        this.renderer.setAttribute(script, 'data-render', 'button');
        this.renderer.setAttribute(
          script,
          'data-public-key',
          environment.llavePublica
        );
        this.renderer.setAttribute(script, 'data-currency', 'COP');
        this.renderer.setAttribute(
          script,
          'data-amount-in-cents',
          total.toString()
        );
        this.renderer.setAttribute(script, 'data-redirect-url', url);
        this.renderer.setAttribute(script, 'data-reference', referencia);
        this.renderer.setAttribute(script, 'data-signature:integrity', hash);
        while (wompiWidget?.firstChild) {
          wompiWidget!.removeChild(wompiWidget!.firstChild);
        }
        this.renderer.appendChild(wompiWidget, script);
      } else {
        while (wompiWidget?.firstChild) {
          wompiWidget!.removeChild(wompiWidget!.firstChild);
        }
      }
    });
  }

  seleccionarInformacion(id: number) {
    this.informacionFacturacionSeleccionada = id;
  }

  ngOnDestroy(): void {
    this.alertaService.cerrarMensajes();
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirModal() {
    this.toggleModal$.next(true);
  }

  editarInformacion(id: number) {
    this.estaEditando = true;
    this.informacionFacturacionSeleccionadaId = id.toString();
    this.abrirModal();
    this.changeDetectorRef.detectChanges();
  }

  cerrarModal() {
    this.toggleModal$.next(false);
    this.informacionFacturacionSeleccionadaId = null;
  }

  abrirModalParaNuevo() {
    this.estaEditando = false;
    this.informacionFacturacionSeleccionadaId = null;
    this.abrirModal();
  }

  consultarDetalle() {
    this.facturacionService
      .informacionFacturacion(this.codigoUsuario)
      .subscribe((respuesta) => {
        this.arrFacturacionInformacion = respuesta.informaciones_facturacion;
        if (this.arrFacturacionInformacion.length > 0) {
          this.informacionFacturacionSeleccionada =
            this.arrFacturacionInformacion[0].id;
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  eliminarInformacion(id: number) {
    this.alerta
      .confirmar({
        titulo: '¿Estas seguro?',
        texto: 'Esta operación no se puede revertir',
        textoBotonCofirmacion: 'Si, eliminar',
      })
      .then((respuesta) => {
        if (respuesta.isConfirmed) {
          this.facturacionService
            .eliminarInformacionFacturacion(id)
            .subscribe(() => {
              this.consultarDetalle();
            });
        }
      });
  }
}
