import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputEmailComponent } from '../../../../common/components/ui/form/input-email/input-email.component';
import { InputComponent } from '../../../../common/components/ui/form/input/input.component';
import { General } from '../../../../common/clases/general';
import { InputGroupDefaultComponent } from '../../../../common/components/ui/form/input-group-default/input-group-default.component';
import { environment } from '../../../../../environments/environment.development';
import { ContenedorService } from '../../services/contenedor.service';
import { ButtonComponent } from '../../../../common/components/ui/button/button.component';
import { RouterLink } from '@angular/router';

@Component({  
  selector: 'app-contenedor-formulario',
  standalone: true,
  imports: [
    CommonModule,
    InputEmailComponent,
    ReactiveFormsModule,
    InputComponent,
    InputGroupDefaultComponent,
    ButtonComponent,
    RouterLink,
  ],
  templateUrl: './contenedor-formulario.component.html',
  styleUrl: './contenedor-formulario.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContenedorFormularioComponent extends General {
  @Input() visualizarCampoSubdominio: boolean = false;
  @Output() dataFormulario: EventEmitter<any> = new EventEmitter();

  private contenedorService = inject(ContenedorService);

  public dominioApp = environment.dominioApp;
  public procesando = false;
  public nombreEmpresa = '';
  public formularioContenedor = new FormGroup({
    subdominio: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-z-0-9]*$/),
      ])
    ),
    nombre: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100), // Se ha removido la restricción de mayúsculas
      ])
    ),
    plan_id: new FormControl(8),
    correo: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
      Validators.email,
    ]),
    telefono: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15),
        Validators.pattern(/^[\+]?[0-9][\s\-\(\)0-9]{8,14}$/),
      ])
    ),
    reddoc: new FormControl(false),
    ruteo: new FormControl(true),
  });

  enviar() {
    if (this.formularioContenedor.valid) {
      this.procesando = true;

      return this.dataFormulario.emit(this.formularioContenedor.value);
    } else {
      this.formularioContenedor.markAllAsTouched();
    }
  }

  modificarCampoFormulario(campo: 'subdominio', dato: any) {
    this.formularioContenedor?.markAsDirty();
    this.formularioContenedor?.markAsTouched();

    if (campo === 'subdominio') {
      if (!this.visualizarCampoSubdominio) {
        this.nombreEmpresa = this.formularioContenedor.get('nombre')!.value;
        this.nombreEmpresa = this.nombreEmpresa.replace(/ñ/gi, 'n');
        this.nombreEmpresa = this.nombreEmpresa.replace(/[^a-zA-Z0-9]/g, '');
        this.nombreEmpresa = this.nombreEmpresa
          .substring(0, 25)
          .toLocaleLowerCase();
        this.formularioContenedor.get(campo)?.setValue(this.nombreEmpresa);
        this.changeDetectorRef.detectChanges();
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  get formFields() {
    return this.formularioContenedor.controls;
  }

  cambiarTextoAMinusculas() {
    this.formFields.subdominio.setValue(
      this.formFields.subdominio.value.toLowerCase()
    );
  }

  confirmarExistencia() {
    if (this.formFields.subdominio.value !== '') {
      this.contenedorService
        .consultarNombre(this.formFields.subdominio.value)
        .subscribe(({ validar }) => {
          if (!validar) {
            this.formFields.subdominio.setErrors({ ContenedorYaExiste: true });
            this.changeDetectorRef.detectChanges();
          }
        });
    }
  }

  editarSubdominio() {
    this.visualizarCampoSubdominio = !this.visualizarCampoSubdominio;
    this.changeDetectorRef.detectChanges();
  }
}
