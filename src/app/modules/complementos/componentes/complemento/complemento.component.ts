import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { General } from '../../../../common/clases/general';
import { RespuestaComplemento } from '../../../../interfaces/complemento/complemento.interface';
import { ComplementoService } from '../../servicios/complemento.service';
import { ModalDefaultComponent } from '../../../../common/components/ui/modals/modal-default/modal-default.component';

@Component({
  selector: 'app-complemento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalDefaultComponent,
  ],
  templateUrl: './complemento.component.html',
  styleUrl: './complemento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComplementoComponent extends General implements OnInit {

  @ViewChild("contentTemplate") contentTemplate: TemplateRef<any>;

  formularioDinamico: FormGroup;
  formularios: FormGroup[] = [];
  formControls: any[] = [];
  arrComplementos: RespuestaComplemento[];

  private complementoService = inject(ComplementoService);

  ngOnInit(): void {
    this.consultarLista();
  }

  // openWindow(indexFormulario: number, nombreFormulario: string) {
  //   this.windowRef = this.windowService.open(this.contentTemplate, {
  //     title: `Configurar ${nombreFormulario}`,
  //     context: {
  //       indexFormulario,
  //     },
  //   });
  // }

  consultarLista(){
    this.complementoService.listarComplementos().subscribe((respuesta) => {
      this.arrComplementos = respuesta;
      this.crearFormulario();
      this.changeDetectorRef.detectChanges();
    });
  }
  

  crearFormulario() {
    this.arrComplementos.forEach((complemento) => {
      const formGroup = new FormGroup({
        id: new FormControl(complemento.id),
        nombre: new FormControl(complemento.nombre),
        estructura_json: new FormControl(complemento.estructura_json),
        datos_json: new FormArray([]),
      });

      const datosJSON = formGroup.get("datos_json") as FormArray;

      if (Array.isArray(complemento?.datos_json) || complemento?.datos_json === null) {
        complemento.estructura_json?.forEach((estructuraDatos) => {
          const campo = complemento?.datos_json?.filter(
            (campoDatos) => campoDatos.nombre === estructuraDatos.nombre
          );
          const valor = campo?.[0]?.valor || "";
          datosJSON.push(
            new FormGroup({
              valor: new FormControl(
                valor,
                Validators.compose([Validators.required])
              ),
              nombre: new FormControl(estructuraDatos.nombre),
            })
          );
        });
      } else {
        console.error("datos_json debe ser de tipo Array");
      }

      this.formularios.push(formGroup);
    });

    this.changeDetectorRef.detectChanges();
  }

  guardarInformacion(indexFormulario: string){

  }


  instalar(complemento: any) {
    const complementoModificado = { ...complemento, instalado: true };
    this.complementoService
      .instalarComplemento(complementoModificado.id, complementoModificado)
      .subscribe((respuesta) => {
        this.consultarLista();
        this.changeDetectorRef.detectChanges();
      });
  }

 }
